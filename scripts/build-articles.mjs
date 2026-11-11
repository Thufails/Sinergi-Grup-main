import { access, readFile, unlink, writeFile } from "node:fs/promises";
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

function decodeHeadingText(value) {
    return value
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

function slugifyHeading(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "bagian";
}

function addTableOfContents(content) {
    const usedIds = new Map();
    const headings = [];
    const contentWithIds = content.replace(/<h2>([\s\S]*?)<\/h2>/gi, function (match, rawTitle) {
        const title = decodeHeadingText(rawTitle);
        const baseId = slugifyHeading(title);
        const occurrence = (usedIds.get(baseId) || 0) + 1;
        usedIds.set(baseId, occurrence);
        const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
        headings.push({ id, title });
        return `<h2 id="${id}">${rawTitle}</h2>`;
    });

    if (headings.length < 3) return contentWithIds;

    const toc = `
            <nav class="article-toc" aria-label="Daftar isi artikel">
                <p class="article-toc-title">Di artikel ini</p>
                <ol>${headings.map(function (heading) {
                    return `<li><a href="#${heading.id}">${escapeHtml(heading.title)}</a></li>`;
                }).join("")}</ol>
            </nav>`;
    const introPattern = /(<p class="article-intro">[\s\S]*?<\/p>)/i;

    if (introPattern.test(contentWithIds)) {
        return contentWithIds.replace(introPattern, `$1${toc}`);
    }

    return `${toc}${contentWithIds}`;
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

        if (!(article.status === "draft" || article.status === "published")) {
            throw new Error(`Article ${article.slug} must have status "draft" or "published".`);
        }
        if (article.featured && article.status !== "published") {
            throw new Error(`Draft article ${article.slug} cannot be featured.`);
        }

        for (const key of ["title", "category", "summary", "description", "image", "imageAlt", "content"]) {
            if (typeof article[key] !== "string" || !article[key].trim()) {
                throw new Error(`Article ${article.slug} is missing ${key}.`);
            }
        }

        if (!Array.isArray(article.topics) || article.topics.length === 0 || article.topics.some(function (topic) {
            return typeof topic !== "string" || !topic.trim();
        })) {
            throw new Error(`Article ${article.slug} must have at least one topic.`);
        }

        if (article.image.includes("..") || path.isAbsolute(article.image)) {
            throw new Error(`Article ${article.slug} has an unsafe image path.`);
        }

        if (article.featured && article.status === "published") featuredCount += 1;
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
        <article class="editorial-card editorial-card--${article.slug}" data-category="${escapeHtml(article.category.toLocaleLowerCase("id-ID"))}">
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

function renderArticleFilters() {
    const categories = [...new Set(articles
        .filter(function (article) { return article.status === "published" && !article.featured; })
        .map(function (article) { return article.category; }))];

    return [
        `<button type="button" class="article-filter is-active" data-article-filter="*" aria-pressed="true">Semua topik</button>`,
        ...categories.map(function (category) {
            const normalizedCategory = category.toLocaleLowerCase("id-ID");
            return `<button type="button" class="article-filter" data-article-filter="${escapeHtml(normalizedCategory)}" aria-pressed="false">${escapeHtml(category)}</button>`;
        }),
    ].join("\n");
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

function renderRelatedArticles(currentArticle) {
    const currentTopics = new Set(currentArticle.topics);
    const related = articles
        .filter(function (article) {
            return article.status === "published" && article.slug !== currentArticle.slug;
        })
        .map(function (article, index) {
            const score = article.topics.reduce(function (total, topic) {
                return total + (currentTopics.has(topic) ? 1 : 0);
            }, 0);
            const sameCategory = article.category === currentArticle.category;
            return { article, index, sameCategory, score };
        })
        .sort(function (left, right) {
            return Number(right.sameCategory) - Number(left.sameCategory) || right.score - left.score || left.index - right.index;
        })
        .slice(0, 3);

    const cards = related.map(function ({ article }) {
        const href = `${article.slug}.html`;
        return `
            <article class="editorial-card editorial-card--${article.slug}">
                <a class="editorial-card-image" href="${href}" tabindex="-1" aria-hidden="true">
                    <img src="../${escapeHtml(article.image)}" alt="" loading="lazy" decoding="async">
                </a>
                <div class="editorial-card-content">
                    <span class="article-category">${escapeHtml(article.category)}</span>
                    <h3><a href="${href}">${escapeHtml(article.title)}</a></h3>
                    <p>${escapeHtml(article.summary)}</p>
                    <a href="${href}" class="text-link">Baca artikel</a>
                </div>
            </article>`;
    }).join("\n");

    return `
        <section class="article-related" aria-labelledby="article-related-title">
            <div class="section-heading article-related-heading">
                <p class="eyebrow">Lanjutkan membaca</p>
                <h2 id="article-related-title">Artikel terkait</h2>
            </div>
            <div class="editorial-grid">${cards}</div>
        </section>`;
}

async function build() {
    validateArticles(articles);
    const publishedArticles = articles.filter(function (article) {
        return article.status === "published";
    });

    for (const article of articles) {
        const imagePath = path.join(projectRoot, article.image);
        await access(imagePath);
    }

    const [articleTemplate, blogTemplate] = await Promise.all([
        readFile(articleTemplatePath, "utf8"),
        readFile(blogTemplatePath, "utf8"),
    ]);

    for (const article of articles) {
        const articlePath = path.join(projectRoot, "artikel", `${article.slug}.html`);

        if (article.status !== "published") {
            await unlink(articlePath).catch(function (error) {
                if (error.code !== "ENOENT") throw error;
            });
            continue;
        }

        const rendered = renderTemplate(articleTemplate, {
            CATEGORY: escapeHtml(article.category),
            CONTENT: addTableOfContents(article.content),
            DESCRIPTION: escapeHtml(article.description),
            IMAGE: escapeHtml(article.image),
            IMAGE_ALT: escapeHtml(article.imageAlt),
            SUMMARY: escapeHtml(article.summary),
            SLUG: escapeHtml(article.slug),
            TITLE: escapeHtml(article.title),
            RELATED_ARTICLES: renderRelatedArticles(article),
        }, "article.html");

        await writeFile(articlePath, rendered.trimStart(), "utf8");
    }

    const featuredArticle = publishedArticles.find(function (article) {
        return article.featured;
    });
    const articleCards = publishedArticles
        .filter(function (article) {
            return !article.featured;
        })
        .map(renderArticleCard)
        .join("\n");
    const renderedBlog = renderTemplate(blogTemplate, {
        ARTICLE_CARDS: articleCards,
        ARTICLE_FILTERS: renderArticleFilters(),
        FEATURED_ARTICLE: renderFeaturedArticle(featuredArticle),
    }, "blog.html");

    await writeFile(path.join(projectRoot, "blog.html"), renderedBlog, "utf8");
    console.log(`Built ${publishedArticles.length} published article pages (${articles.length - publishedArticles.length} drafts excluded) and the article listing.`);
}

build().catch(function (error) {
    console.error(error.message);
    process.exitCode = 1;
});
