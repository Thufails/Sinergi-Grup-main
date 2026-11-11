import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { articles } from "../artikel/articles.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const articleTemplatePath = path.join(projectRoot, "templates", "article.html");
const blogTemplatePath = path.join(projectRoot, "templates", "blog.html");

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }[character];
    });
}

function renderTemplate(template, values, templateName) {
    const rendered = template.replace(/\{\{([A-Z_]+)\}\}/g, function (token, key) {
        if (!(key in values)) {
            throw new Error(`Missing template value ${key} in ${templateName}`);
        }
        return values[key];
    });

    if (/\{\{[A-Z_]+\}\}/.test(rendered)) {
        throw new Error(`Unresolved placeholder in ${templateName}`);
    }

    return rendered;
}

function validateArticles(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Article data must contain at least one article.");
    }

    const slugs = new Set();
    let featuredCount = 0;

    for (const article of items) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
            throw new Error(`Invalid article slug: ${article.slug}`);
        }
        if (slugs.has(article.slug)) {
            throw new Error(`Duplicate article slug: ${article.slug}`);
        }
        slugs.add(article.slug);

        for (const key of ["title", "category", "summary", "description", "image", "imageAlt", "content"]) {
            if (typeof article[key] !== "string" || !article[key].trim()) {
                throw new Error(`Article ${article.slug} is missing ${key}.`);
            }
        }

        if (article.image.includes("..") || path.isAbsolute(article.image)) {
            throw new Error(`Article ${article.slug} has an unsafe image path.`);
        }

        if (article.featured) featuredCount += 1;
    }

    if (featuredCount !== 1) {
        throw new Error(`Expected exactly one featured article; found ${featuredCount}.`);
    }
}

function renderArticleCard(article) {
    const href = `artikel/${article.slug}.html`;
    const title = escapeHtml(article.title);
    const summary = escapeHtml(article.summary);
    const category = escapeHtml(article.category);
    const image = escapeHtml(article.image);

    return `
        <article class="editorial-card">
            <a class="editorial-card-image" href="${href}" tabindex="-1" aria-hidden="true">
                <img src="${image}" alt="" loading="lazy" decoding="async">
            </a>
            <div class="editorial-card-content">
                <span class="article-category">${category}</span>
                <h3><a href="${href}">${title}</a></h3>
                <p>${summary}</p>
                <a href="${href}" class="text-link">Baca artikel</a>
            </div>
        </article>`;
}

function renderFeaturedArticle(article) {
    const href = `artikel/${article.slug}.html`;
    const title = escapeHtml(article.title);

    return `
        <section class="featured-article" aria-label="Artikel unggulan">
            <a class="featured-article-image" href="${href}" tabindex="-1" aria-hidden="true">
                <img src="${escapeHtml(article.image)}" alt="" fetchpriority="high" decoding="async">
            </a>
            <div class="featured-article-content">
                <span class="article-category">${escapeHtml(article.category)}</span>
                <p class="article-kicker">Artikel pilihan</p>
                <h2 id="featured-title">${title}</h2>
                <p>${escapeHtml(article.summary)}</p>
                <a href="${href}" class="button button-dark">Baca artikel</a>
            </div>
        </section>`;
}

async function build() {
    validateArticles(articles);

    for (const article of articles) {
        const imagePath = path.join(projectRoot, article.image);
        await access(imagePath);
    }

    const [articleTemplate, blogTemplate] = await Promise.all([
        readFile(articleTemplatePath, "utf8"),
        readFile(blogTemplatePath, "utf8"),
    ]);

    for (const article of articles) {
        const rendered = renderTemplate(articleTemplate, {
            CATEGORY: escapeHtml(article.category),
            CONTENT: article.content,
            DESCRIPTION: escapeHtml(article.description),
            IMAGE: escapeHtml(article.image),
            IMAGE_ALT: escapeHtml(article.imageAlt),
            SUMMARY: escapeHtml(article.summary),
            TITLE: escapeHtml(article.title),
        }, "article.html");

        await writeFile(path.join(projectRoot, "artikel", `${article.slug}.html`), rendered.trimStart(), "utf8");
    }

    const featuredArticle = articles.find(function (article) {
        return article.featured;
    });
    const articleCards = articles
        .filter(function (article) {
            return !article.featured;
        })
        .map(renderArticleCard)
        .join("\n");
    const renderedBlog = renderTemplate(blogTemplate, {
        ARTICLE_CARDS: articleCards,
        FEATURED_ARTICLE: renderFeaturedArticle(featuredArticle),
    }, "blog.html");

    await writeFile(path.join(projectRoot, "blog.html"), renderedBlog, "utf8");
    console.log(`Built ${articles.length} article pages and the article listing.`);
}

build().catch(function (error) {
    console.error(error.message);
    process.exitCode = 1;
});
