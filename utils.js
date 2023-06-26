const constants = require('./const')


const formatMediumResponse = (response) => {
    const body = response.body
    const strippedBody = body.substring(constants.mediumResPrefix.length)
    console.log(strippedBody)
    const parsedBody = JSON.parse(strippedBody)
    return parsedBody
}

const getMediumMediaUrl = (mediaId) => {
    return `${constants.mediumMediaUrl}/${mediaId}`
}


const getPostBodyParagraphMarkdown = (paragraph) => {

    let text = paragraph.text ? paragraph.text : ""

    if (paragraph.markups) {
        paragraph.markups.forEach(markup => {
            text = applyPostBodyParagraphMarkupMarkdown(text, markup)
        })
    }

    text = formatPostBodyParagraphMarkdown(text, paragraph)
    return text
}

const applyPostBodyParagraphMarkupMarkdown = (text, markup) => {
    const start = markup.start
    const end = markup.end
    const markupText = text.substring(start, end)

    switch (markup.type) {
        case 1:
            text = text.replace(markupText, `**${markupText}**`)
            break
        case 2:
            text = text.replace(markupText, `*${markupText}*`)
            break
        case 3:
            text = text.replace(markupText, `[${markupText}](${markup.href})`)
            break
    }

    return text
}


const formatPostBodyParagraphMarkdown = (text, paragraph) => {
    switch (paragraph.type) {
        case 1:
            return text
        case 3:
            return `# ${text}`
        case 4:
            return `![](${getMediumMediaUrl(paragraph.metadata.id)})`
        case 9:
            return `- ${text}`
        case 13:
            return `## ${text}`
    }
}


const getPostBodyParagraphHTML = (paragraph) => {

        let text = paragraph.text ? paragraph.text : ""

        if (paragraph.markups) {
            paragraph.markups.forEach(markup => {
                text = applyPostBodyParagraphMarkupHTML(text, markup)
            })
        }

        text = formatPostBodyParagraphHTML(text, paragraph)
        return text
}

const applyPostBodyParagraphMarkupHTML = (text, markup) => {
    const start = markup.start
    const end = markup.end
    const markupText = text.substring(start, end)

    switch (markup.type) {
        case 1:
            text = text.replace(markupText, `<strong>${markupText}</strong>`)
            break
        case 2:
            text = text.replace(markupText, `<em>${markupText}</em>`)
            break
        case 3:
            text = text.replace(markupText, "<a href=" + markup.href + ">" + markupText + "</a>")
            break
    }

    return text
}

const formatPostBodyParagraphHTML = (text, paragraph) => {
    switch (paragraph.type) {
        case 1:
            return text
        case 3:
            return `<h1>${text}</h1>`
        case 4:
            return `<img src='${getMediumMediaUrl(paragraph.metadata.id)}'>`
        case 9:
            return `<li>${text}</li>`
        case 13:
            return `<h2>${text}</h2>`
    }
}


module.exports = {
    formatMediumResponse,
    getMediumMediaUrl,
    getPostBodyParagraphMarkdown,
    getPostBodyParagraphHTML
}