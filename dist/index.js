#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var os_1 = __importDefault(require("os"));
var glob_1 = __importDefault(require("glob"));
if (process.argv.length <= 2) {
    console.log('Usage: ' + __filename + ' path/to/directory');
    process.exit(-1);
}
var path = process.argv[2];
glob_1.default('**/*.component.ts', {
    cwd: path,
    nodir: true
}, function (err, files) {
    var tsSnippetsPath = os_1.default.homedir + '/Library/Application\ Support/Code/User/snippets/typescript.json';
    var tsSnippets = {};
    try {
        var tsSnippets_1 = JSON.parse(fs_1.default.readFileSync(tsSnippetsPath, 'utf8'));
    }
    catch (e) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not open snippet file. Creating new one');
    }
    files.forEach(function (file) {
        var _a;
        var fileData = fs_1.default.readFileSync(path + '/' + file, 'utf8');
        var selectorRegex = /selector:\s\'(.*?)\'/g;
        var selectorMatch = selectorRegex.exec(fileData);
        if (selectorMatch !== null) {
            var selector = selectorMatch[1];
            var template = void 0;
            template = [];
            template = template.concat([
                '<' + selector.trim()
            ]);
            var inputRegex = /\@Input\(\)\n(.*?)(:|\s\=)/g;
            var inputs = void 0;
            while ((inputs = inputRegex.exec(fileData)) !== null) {
                template = template.concat([
                    '\t[' + inputs[1].trim() + ']=""'
                ]);
            }
            var outputRegex = /\@Output\(\)\n(.*?)(:|\s\=)/g;
            var outputs = void 0;
            while ((outputs = outputRegex.exec(fileData)) !== null) {
                template = template.concat([
                    '\t(' + outputs[1].trim() + ')=""'
                ]);
            }
            template = template.concat([
                '>',
                '</' + selector + '>'
            ]);
            tsSnippets = __assign({}, tsSnippets, (_a = {}, _a[selector] = {
                prefix: selector,
                body: template,
                description: selector + ' snippet'
            }, _a));
        }
    });
    fs_1.default.writeFile(tsSnippetsPath, JSON.stringify(tsSnippets, null, 4), function (err) {
        if (err)
            throw err;
    });
    console.log('\x1b[32m%s\x1b[0m', 'Successfully generated snippet.');
});
