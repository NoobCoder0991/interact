const Fuse = require('fuse.js');




function match(query, references, threshold) {
    const options = {
        includeScore: true,
        threshold: threshold
    };
    const fuse = new Fuse(references, options);
    const result = fuse.search(query);
    return result;
}



module.exports = { match }