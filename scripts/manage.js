const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECTS_FILE = path.join(__dirname, '../projects/projects.json');
const PHOTOS_DIR = path.join(__dirname, '../photos');
const GALLERY_FILE = path.join(__dirname, '../photos/gallery.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function addProject() {
    console.log('\n--- Add New Project ---\n');

    const title = await askQuestion('Project Title: ');
    const description = await askQuestion('Description: ');
    const imageUrl = await askQuestion('Image URL (relative, e.g., ../projects/images/foo.png): ');
    const linkUrl = await askQuestion('Link URL: ');
    const tags = await askQuestion('Tags (comma separated): ');

    const newProject = {
        title,
        description,
        imageUrl,
        linkUrl,
        tags
    };

    let projects = [];
    if (fs.existsSync(PROJECTS_FILE)) {
        try {
            const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
            projects = JSON.parse(data);
        } catch (err) {
            console.error('Error reading projects file:', err);
            return;
        }
    }

    projects.push(newProject);

    try {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 4));
        console.log('\n✅ Project added successfully!');
    } catch (err) {
        console.error('Error writing projects file:', err);
    }
}

function updateGallery() {
    console.log('\n--- Update Gallery ---\n');

    if (!fs.existsSync(PHOTOS_DIR)) {
        console.error('Photos directory not found!');
        return;
    }

    const files = fs.readdirSync(PHOTOS_DIR);
    const imageFiles = files.filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file));

    const galleryData = imageFiles.map(file => {
        // We assume previews are in a 'previews' subdirectory if they exist, 
        // but for simplicity in this local version, we might just link to the file itself 
        // or let the gallery.js handle the path logic.
        // Let's stick to the structure gallery.js expects but adapted for local serving.

        return {
            name: file,
            type: 'file',
            // In a real local setup, we might not need full GitHub API structure, 
            // but let's keep it compatible with what we plan to change gallery.js to.
            // Actually, let's just store the filenames and let gallery.js resolve the paths.
        };
    });

    try {
        fs.writeFileSync(GALLERY_FILE, JSON.stringify(galleryData, null, 4));
        console.log(`✅ Gallery updated with ${galleryData.length} images.`);
    } catch (err) {
        console.error('Error writing gallery file:', err);
    }
}

async function main() {
    console.log('Welcome to elouan.xyz Manager');
    console.log('1. Add Project');
    console.log('2. Update Gallery JSON');
    console.log('3. Exit');

    const choice = await askQuestion('\nChoose an option (1-3): ');

    switch (choice.trim()) {
        case '1':
            await addProject();
            break;
        case '2':
            updateGallery();
            break;
        case '3':
            console.log('Bye!');
            process.exit(0);
            break;
        default:
            console.log('Invalid option.');
            break;
    }

    rl.close();
}

main();
