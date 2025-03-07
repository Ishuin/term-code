#!/usr/bin/env node

/**
 * Simple test script to run the compiled code
 */
import '../dist/src/cli.js';

// The CLI will automatically execute the main function
// This script just loads it with proper ESM support
console.log('Test script loaded the CLI module'); 