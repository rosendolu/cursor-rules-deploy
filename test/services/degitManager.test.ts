import DegitManager from '@/services/degitManager.js';
import fs from 'fs-extra';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import os from 'os';
import path from 'path';

test('cleanupTempDir removes temporary directory and its contents', async () => {
    // Create a temporary directory
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'degit-test-'));

    try {
        // Create some test files and directories
        await fs.ensureDir(path.join(tempDir, 'subdir'));
        await fs.writeFile(path.join(tempDir, 'test.txt'), 'test content');
        await fs.writeFile(path.join(tempDir, 'subdir', 'test2.txt'), 'test content 2');

        // Make some files read-only to test cleanup of protected files
        await fs.chmod(path.join(tempDir, 'test.txt'), 0o444);
        await fs.chmod(path.join(tempDir, 'subdir', 'test2.txt'), 0o444);

        // Verify files exist before cleanup
        assert.equal(await fs.pathExists(tempDir), true, 'Temp directory should exist before cleanup');
        assert.equal(await fs.pathExists(path.join(tempDir, 'test.txt')), true, 'Test file should exist before cleanup');
        assert.equal(await fs.pathExists(path.join(tempDir, 'subdir', 'test2.txt')), true, 'Test file in subdir should exist before cleanup');

        // Run cleanup
        await DegitManager.cleanupTempDir(tempDir);

        // Verify directory and contents are removed
        assert.equal(await fs.pathExists(tempDir), false, 'Temp directory should be removed after cleanup');
        assert.equal(await fs.pathExists(path.join(tempDir, 'test.txt')), false, 'Test file should be removed after cleanup');
        assert.equal(await fs.pathExists(path.join(tempDir, 'subdir', 'test2.txt')), false, 'Test file in subdir should be removed after cleanup');
    } catch (error) {
        // Ensure cleanup runs even if test fails
        await fs.remove(tempDir).catch(() => {});
        throw error;
    }
});
