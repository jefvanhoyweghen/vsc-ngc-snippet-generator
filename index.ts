var glob = require('glob');
var fs = require('fs');
var os = require('os');
 
if (process.argv.length <= 2) {
    console.log('Usage: ' + __filename + ' path/to/directory');
    process.exit(-1);
}
 
var path = process.argv[2];
 
glob(
    '**/*.component.ts',
    {
        cwd: path,
        nodir: true
    },
    function(er, files) {
        const tsSnippetsPath = os.homedir + '/Library/Application\ Support/Code/User/snippets/typescript.json';

        let tsSnippets = {};

        try {
            let tsSnippets = JSON.parse(fs.readFileSync(tsSnippetsPath, 'utf8'));
        } catch(e) {
            console.log('\x1b[33m%s\x1b[0m', 'Could not open snippet file. Creating new one');
        }

        files.forEach(file => {
            const fileData = fs.readFileSync(path + '/' + file, 'utf8');

            var selectorRegex = /selector:\s\'(.*?)\'/g;
            var selectorMatch = selectorRegex.exec(fileData);

            if (selectorMatch !== null) {
                var selector = selectorMatch[1];

                var template = [];

                template.push('<' + selector.trim());
                
                var inputRegex = /\@Input\(\)\n(.*?)(:|\s\=)/g;
                var inputs;
                while ((inputs = inputRegex.exec(file)) !== null) {
                    template.push('\t[' + inputs[1].trim() + ']=""');
                }

                var outputRegex = /\@Output\(\)\n(.*?)(:|\s\=)/g;
                var outputs;
                while ((outputs = outputRegex.exec(file)) !== null) {
                    template.push('\t(' + outputs[1].trim() + ')=""');
                }

                template.push('>');
                template.push('</' + selector + '>');

                tsSnippets[selector] = {
                    prefix: selector,
                    body: template,
                    description: selector + ' snippet'
                };
            }
        });

        fs.writeFile(tsSnippetsPath, JSON.stringify(tsSnippets, null, 4), function(err){
            if (err) throw err;
        });

        console.log('\x1b[32m%s\x1b[0m', 'Successfully generated snippet.');
    }
);

