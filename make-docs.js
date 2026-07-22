import fs from 'node:fs';
import { formatNamePath, parseNamePath } from "@toptensoftware/jsdoc";

let groups = new Map();

function encodeHtmlEntities(str) {
  return str.replace(/[&<>"'`]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }[char]));
}

let moduleThis = "@toptensoftware/cantabile-js"

function urlForNamePath(np)
{
    let npp = parseNamePath(np);

    if (npp[0].prefix == "module:")
    {
        if (npp[0].name == moduleThis)
            npp.shift();
        else
            throw new Error(`Cant generate url for external module ${npp[0].name}`);
    }


    let path = npp.shift().name;
    if (npp.length)
    {
        npp[0].delim = "";
    }
    let id = formatNamePath(npp);

    return { path, id }
}
    

// Given a name, work out which group it belongs to
function groupForNamePath(namepath)
{
    let url = urlForNamePath(namepath);

    let g = groups.get(url.path);
    if (!g)
    {
        g = {
            filename: `${url.path}`,
            title: `${url.path}`,
            output: "",
            writer: { write: x => g.output += x },
        }
        g.url = url;
        groups.set(url.path, g);

        g.writer.write(`---\n`);
        g.writer.write(`title: ${g.title}\n`);
        g.writer.write(`description: ${g.title} Reference\n`);
        g.writer.write(`---\n\n`);
    }

    return g;
}

function formatUrl(url)
{
    let href = url.path;
    if (url.id)
        href += "#" + url.id;
    return href;
}

let declaredUrls = new Set();
let referencedUrls = new Set();
function registerUrlDeclaration(url)
{
    let href = formatUrl(url);
    if (declaredUrls.has(href))
        throw new Error(`Multiple declarations of ${href}`);
    declaredUrls.add(href);
}

function registerUrlReference(url)
{
    referencedUrls.add(formatUrl(url));
}


// Load index.d.json
let defs = JSON.parse(fs.readFileSync("types.d.json", "utf8"));

// Sort definitions alphabetically
defs.members[0].members.sort((a,b) => a.name.localeCompare(b.name));

// Render all members to appropriate group
let currentGroup;
for (let n of defs.members[0].members)
{
    currentGroup = groupForNamePath(n.name);
    registerUrlDeclaration(currentGroup.url);
    render(currentGroup.writer, 1, n);
}

// Make sure output directory exists
fs.mkdirSync("./docs/API/", { recursive: true });

// Write the group files
for (let g of groups.values())
{
    fs.writeFileSync(`./docs/API/${g.filename}.md`, g.output, "utf8");
}

// Write index.md
fs.writeFileSync(`./docs/API/index.md`, `---
folder:
    title: API Reference
---
`, "utf8");


for (let href of referencedUrls) {
    if (!declaredUrls.has(href))
    {
        console.log(`warning: link ${href} not declared`)
    }
}

// Done!
console.log("OK");


// Strip our module name from a namepath
function stripModuleFromNamepath(np)
{
    if (np.startsWith("module:@toptensoftware/cantabile-js."))
        np = np.substring("module:@toptensoftware/cantabile-js.".length);
    return np;
}

// Expand inline links
function expandInline(links, text)
{
    if (!links || !links.length)
        return text;

    return text.replace(/\{@link (\d+)\}/g, (text, id) => {

        let link = links[parseInt(id)];
        if (!link)
            return text;

        // Work out title
        let title = link.title;
        if (!title)
            title = link.url;

        // Work out url
        let href = link.url;
        if (!href)
        {
            // Get the url for this name path
            let url = urlForNamePath(link.namepath);
            registerUrlReference(url);
            if (url.path == currentGroup.filename)
            {
                href = ""
            }
            else
            {
                href = url.path
            }

            if (url.id)
            {
                href += "#" + url.id;
            }

            // Work out title
            if (!title)
            {
            }
        }

        if (!title)
            title = href;

        // Plain or code?
        if (link.kind == "linkcode")
            return `[\`${title}\`](${href})`;
        else
            return `[${title}](${href})`;
    });
}

function getDescription(el)
{
    if (!el.jsdoc)
        return null;

    let descblock = el.jsdoc.find(x => x.kind == "description");
    if (!descblock)
        descblock = el.jsdoc.find(x => x.kind == null);

    if (!descblock)
        return null;

    return expandInline(el.links, descblock.text);
}

function render(w, depth, el)
{
    if (el.kind != "get" && el.kind != "set")
    {
        let title = el.name;

        switch (el.kind)
        {
            case "class": title += " Class"; break;
            case "interface": title += " Interface"; break;
            case "constructor": title += "()"; break;
            case "function": title += "()"; break;
            case "method": title += "()"; break;
            case "type-alias": title += " Type"; break;
            case "event": title = `'${title}' Event`; break;
        }

        if (el.static)
            title += " (static)";

        let id = "";
        if (el.namepath)
        {
            let url = urlForNamePath(el.namepath);
            if (url.id)
            {
                registerUrlDeclaration(url);
                id = ` \{#${url.id}\}`
            }
        }
        w.write(`${"######".substring(0, depth)} ${title}${id}\n\n`);
    }
    
    let desc = getDescription(el);
    if (desc)
    {
        w.write(desc);
        w.write("\n\n");
    }

    if (el.definition)
    {
        // Strip "export" from the definition
        let def = el.definition;
        def = def.replace(/^\s*export\s/, "");

        // Write it as a code block
        w.write("```ts\n");
        w.write(def);
        w.write("\n```\n\n");
    }

    if (el.jsdoc)
    {
        for (let p of el.jsdoc.filter(x => x.block == "param"))
        {
            w.write(`* **\`${p.specifier}\`** ${expandInline(el.links, p.text.replace(/^\s*-\s*/, ""))}\n`);
        }

        if (el.kind == "event")
        {
            for (let p of el.jsdoc.filter(x => x.block == "property"))
            {
                w.write(`* **\`${p.specifier}\`** ${expandInline(el.links, p.text.replace(/^\s*-\s*/, ""))}\n`);
            }
        }
    }

    if (el.members)
    {
        el.members.sort((a,b) => a.name.localeCompare(b.name));
        if (el.kind == "class")
        {
            renderMemberKind("constructor", "Constructors");
            renderMemberKind("property", "Properties");
            renderMemberKind("method", "Methods");
            renderMemberKind("event", "Events");

            function renderMemberKind(kind, title)
            {
                let membersOfKind = el.members.filter(x => x.kind == kind);
                if (membersOfKind.length == 0)
                    return;

                w.write(`${"######".substring(0, depth + 1)} ${title}\n\n`);
                membersOfKind.forEach(x => render(w, depth+2, x));
            }
        }
        else
        {
            for (let m of el.members)
            {
                render(w, depth+1, m);
            }
        }
    }

    if (el.jsdoc)
    {
        for (let p of el.jsdoc.filter(x => x.block == "example"))
        {
            let code = p.text.replace(/^\*?\n?/, "").replace(/\n*$/, "");
            w.write(`Example\n\n`);
            w.write("```js\n");
            w.write(code);
            w.write("\n```\n\n");
        }
    }

}


