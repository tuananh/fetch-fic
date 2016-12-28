'use strict'
const path = require('path')

const Bluebird = require('bluebird')
const uuid = require('uuid')

const fs = use('fs-promises')
const Site = use('site')

const rtfToHTML = require('./rtf-to-html.js')

class Local extends Site {
  static matches (siteUrlStr) {
    return !/:/.test(siteUrlStr)
  }

  constructor (siteUrlStr) {
    super(siteUrlStr)
    this.publisher = 'local'
    this.publisherName = 'Local'
  }

  normalizeLink (href, base) {
    return href
  }

  getFicMetadata (fetch, fic) {
    fic.id = 'urn:uuid:' + uuid.v4()
    fic.publisher = this.publisherName
    fic.updateFrom = fic.link
    fic.link = null
    fic.title = path.basename(fic.updateFrom)
    return this.recursedir(fic, fic.updateFrom)
  }

  recursedir (fic, dir) {
    return fs.readdir(dir).then(files => {
      files.sort()
      const todo = []
      for (let file of files) {
        const filename = path.join(dir, file)
        const info = fs.statSync(filename)
        if (info.isDirectory()) {
          todo.push(this.recursedir(fic, filename))
        } else if (/\.rtf$/.test(filename)) {
          const name = path.relative(fic.updateFrom, filename)
          fic.addChapter({name, fetchFrom: filename, created: info.birthtime, modified: info.mtime})
        }
      }
      return Bluebird.all(todo).catch(x => process.emit('error', 'TAP', x))
    })
  }

  scrapeFicMetadata (fetch, fic) {
    // There's never any reason to scrape local content.
    return Bluebird.resolve()
  }

  getChapter (fetch, chapter) {
    return rtfToHTML(fs.readFile(chapter, 'ascii')).then(result => {
      return {
        'finalUrl': chapter,
        'content': result
      }
    })
  }
}
module.exports = Local
