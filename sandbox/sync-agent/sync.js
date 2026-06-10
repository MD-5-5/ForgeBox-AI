import "dotenv/config";
import chokidar from 'chokidar';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const projectId = process.env.PROJECT_ID;
const bucketName = "forgebox-bucket-new";
const localDirectory = '/workspace';

async function checkS3ForFiles() {
    console.log(`Checking S3 for existing files in project: ${projectId}`);
    const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `${projectId}/`
    });
    const listResponse = await s3Client.send(listCommand);
    return listResponse.Contents || [];
}

async function downloadFilesFromS3(s3Objects) {
    console.log("Found existing files in S3. Syncing to local directory...");
    for (const file of s3Objects) {
        // Skip if it is a directory placeholder
        if (file.Key.endsWith('/')) continue;

        const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: file.Key
        });
        const getResponse = await s3Client.send(getCommand);

        const relativePath = file.Key.replace(`${projectId}/`, '');
        const localFilePath = path.join(localDirectory, relativePath);

        // Ensure the local directory structure exists
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });

        const writeStream = fs.createWriteStream(localFilePath);
        getResponse.Body.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log(`Downloaded ${file.Key} to ${localFilePath}`);
    }
}

async function uploadFileToS3(filePath) {
    try {
        if (filePath.includes('node_modules') || filePath.includes('.env')) {
            return; // Skip syncing node_modules and .env files
        }

        const fileContent = fs.readFileSync(filePath);

        // Normalize to forward slashes so the S3 key is valid on all platforms
        const relativePath = path.relative(localDirectory, filePath).replace(/\\/g, '/');
        const s3Key = `${projectId}/${relativePath}`;

        console.log(`Uploading: ${filePath} → s3://${bucketName}/${s3Key}`);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: fileContent
        });

        await s3Client.send(command);
        console.log(`✅ Synced ${filePath} → s3://${bucketName}/${s3Key}`);
    } catch (err) {
        console.error(`❌ Error syncing ${filePath} to S3:`, err);
    }
}

/**
 * Recursively walks localDirectory and returns all absolute file paths,
 * skipping node_modules and .env files.
 */
async function scanLocalFiles(dir) {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const abs = path.join(dir, entry.name);
        if (abs.includes('node_modules') || abs.includes('.env')) continue;
        if (entry.isDirectory()) {
            results.push(...await scanLocalFiles(abs));
        } else {
            results.push(abs);
        }
    }
    return results;
}

/**
 * Uploads every local file that is not already present in S3.
 */
async function uploadLocalFilesToS3() {
    console.log('No files in S3. Uploading all local files...');
    const files = await scanLocalFiles(localDirectory);
    console.log(`Found ${files.length} local file(s) to upload.`);
    for (const filePath of files) {
        await uploadFileToS3(filePath);
    }
}

function startWatcher() {
    console.log('Starting chokidar watch...');
    chokidar.watch(localDirectory, {
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            /node_modules/,  // ignore node_modules completely
            /\.env/          // ignore .env files
        ],
        persistent: true,
        ignoreInitial: true  // init() already handled the initial state; only react to future changes
    }).on('all', async (event, filePath) => {
        if (event === 'add' || event === 'change') {
            await uploadFileToS3(filePath);
        }
    });
}

async function init() {
    try {
        const s3Objects = await checkS3ForFiles();
        const hasFiles = s3Objects.length > 0;

        if (hasFiles) {
            // S3 has files → download them to local
            await downloadFilesFromS3(s3Objects);
        } else {
            // S3 is empty → upload all local files now
            await uploadLocalFilesToS3();
        }

        startWatcher();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

init();
