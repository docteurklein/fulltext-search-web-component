//import { html, define } from "hybrids";
  import { html, define } from 'https://unpkg.com/hybrids@4.0.2/src';
//import lunr from "lunr";

const FullTextSearch = {
  indexUrl: "",
  query: "",
  index: async ({ indexUrl }) => lunr.Index.load(await (await fetch(indexUrl)).json()),
  results: async ({ index, query }) => query ? (await index).search(`${query}*`) : [],
  render: ({ query, results }) => html`
    <input placeholder="search" type="search" oninput="${(host, event) => host.query = event.target.value}" />
    <ul>${html.resolve(
      results.then(
        r => html`${r.map(result => html`<li>
            <a href="${result.ref}">${result.ref}</a>
            <article innerHTML="${html.resolve(fetch(result.ref).then(async content =>
                html`${extract(query, await content.text(), result.matchData.metadata)}`
            ))}"></article>
        </li>`)}`
      ).catch(e => html`${e}`),
      html`…`
    )}</ul>
  `
};

function extract(query, content, metadata) {
    let positions = Object.values(metadata).flatMap((term) => Object.values(term).flatMap(t => t.position));
    return positions
        .map(([start, len]) => `[…] ${content.substring(start - 10, start + len + 10)} […]`)
        .map(fragment => fragment.replace(new RegExp(`(${query})`, 'i'), `<mark>$1</mark>`))
    ;
}

define("fulltext-search", FullTextSearch);
