import { copyDirectory, copyFile, ensureDir, updateFile } from '@/services/fileManager.js';
import fs from 'fs-extra';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import os from 'os';
import path from 'path';

test('copyFile', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-manager-test-'));
    const sourceFile = path.join(tempDir, 'source.txt');
    const destFile = path.join(tempDir, 'dest.txt');
    const content = 'test content';

    try {
        // Create source file
        await fs.writeFile(sourceFile, content);

        // Test copying to non-existent destination
        await copyFile(sourceFile, destFile);
        const exists = await fs.pathExists(destFile);
        assert.equal(exists, true, 'Destination file should be created');

        const destContent = await fs.readFile(destFile, 'utf8');
        assert.equal(destContent, content, 'Content should match');

        // Test copying when destination exists
        await fs.writeFile(destFile, 'different content');
        await copyFile(sourceFile, destFile);
        const newContent = await fs.readFile(destFile, 'utf8');
        assert.equal(newContent, 'different content', 'Existing file should not be overwritten');
    } finally {
        // Cleanup
        await fs.remove(tempDir);
    }
});

test('ensureDir', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-manager-test-'));
    const testDir = path.join(tempDir, 'test-dir');

    try {
        // Test directory creation
        await ensureDir(testDir);
        const exists = await fs.pathExists(testDir);
        assert.equal(exists, true, 'Directory should be created');

        // Test idempotency
        await ensureDir(testDir);
        const stats = await fs.stat(testDir);
        assert.equal(stats.isDirectory(), true, 'Should still be a directory after second call');
    } finally {
        // Cleanup
        await fs.remove(tempDir);
    }
});

test('copyDirectory', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-manager-test-'));
    const sourceDir = path.join(tempDir, 'source');
    const destDir = path.join(tempDir, 'dest');

    try {
        // Create source directory with some files
        await fs.ensureDir(sourceDir);
        await fs.writeFile(path.join(sourceDir, 'file1.txt'), 'content1');
        await fs.writeFile(path.join(sourceDir, 'file2.txt'), 'content2');
        await fs.ensureDir(path.join(sourceDir, 'subdir'));
        await fs.writeFile(path.join(sourceDir, 'subdir', 'file3.txt'), 'content3');

        // Test copying directory
        await copyDirectory(sourceDir, destDir);

        // Verify directory structure and contents
        assert.equal(await fs.pathExists(destDir), true, 'Destination directory should exist');
        assert.equal(await fs.pathExists(path.join(destDir, 'file1.txt')), true, 'file1.txt should exist');
        assert.equal(await fs.pathExists(path.join(destDir, 'file2.txt')), true, 'file2.txt should exist');
        assert.equal(await fs.pathExists(path.join(destDir, 'subdir')), true, 'subdir should exist');
        assert.equal(await fs.pathExists(path.join(destDir, 'subdir', 'file3.txt')), true, 'file3.txt should exist');

        // Verify file contents
        assert.equal(await fs.readFile(path.join(destDir, 'file1.txt'), 'utf8'), 'content1');
        assert.equal(await fs.readFile(path.join(destDir, 'file2.txt'), 'utf8'), 'content2');
        assert.equal(await fs.readFile(path.join(destDir, 'subdir', 'file3.txt'), 'utf8'), 'content3');
    } finally {
        // Cleanup
        await fs.remove(tempDir);
    }
});

test('updateFile', async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-manager-test-'));
    const testFile = path.join(tempDir, 'test.txt');
    const initialContent = 'initial content';

    try {
        // Create test file
        await fs.writeFile(testFile, initialContent);

        // Test updating file content
        await updateFile(testFile, content => content.toUpperCase());
        const updatedContent = await fs.readFile(testFile, 'utf8');
        assert.equal(updatedContent, 'INITIAL CONTENT', 'Content should be uppercase');

        // Test no changes needed
        await updateFile(testFile, content => content);
        const unchangedContent = await fs.readFile(testFile, 'utf8');
        assert.equal(unchangedContent, 'INITIAL CONTENT', 'Content should remain the same');
    } finally {
        // Cleanup
        await fs.remove(tempDir);
    }
});
