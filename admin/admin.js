(function () {
    "use strict";

    const draftStorageKey = "sinergi-article-drafts-v1";
    const fields = {
        title: document.getElementById("articleTitle"),
        slug: document.getElementById("articleSlug"),
        category: document.getElementById("articleCategory"),
        summary: document.getElementById("articleSummary"),
        description: document.getElementById("articleDescription"),
        topics: document.getElementById("articleTopics"),
        body: document.getElementById("articleBody"),
    };
    const editorMessage = document.getElementById("editorMessage");
    const draftList = document.getElementById("draftList");
    const draftCount = document.getElementById("draftCount");
    const wordCount = document.getElementById("wordCount");
    const coverFile = document.getElementById("coverFile");
    const coverPreview = document.getElementById("coverPreview");
    const previewDialog = document.getElementById("previewDialog");
    let activeDraftKey = "";
    let coverObjectUrl = "";
    let slugWasEdited = false;

    function readDrafts() {
        try {
            const stored = JSON.parse(localStorage.getItem(draftStorageKey) || "{}");
            return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
        } catch (error) {
            return {};
        }
    }

    function writeDrafts(drafts) {
        try {
            localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
            return true;
        } catch (error) {
            showMessage("Penyimpanan browser penuh atau tidak tersedia. Unduh data artikel sebagai cadangan.", "error");
            return false;
        }
    }

    function showMessage(message, type) {
        editorMessage.textContent = message;
        editorMessage.className = "editor-message" + (type ? " is-" + type : "");
    }

    function slugify(value) {
        return value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function collectArticle() {
        return {
            slug: fields.slug.value.trim(),
            title: fields.title.value.trim(),
            category: fields.category.value.trim(),
            summary: fields.summary.value.trim(),
            description: fields.description.value.trim(),
            topics: fields.topics.value.split(",").map(function (topic) {
                return slugify(topic.trim());
            }).filter(Boolean),
            content: sanitizeHtml(fields.body.innerHTML),
            status: "draft",
            featured: false,
            updatedAt: new Date().toISOString(),
        };
    }

    function sanitizeHtml(input) {
        const allowedTags = new Set(["P", "H2", "H3", "STRONG", "B", "EM", "I", "UL", "OL", "LI", "BLOCKQUOTE", "A", "BR"]);
        const parser = new DOMParser();
        const documentFragment = parser.parseFromString(String(input || ""), "text/html");

        function clean(parent) {
            Array.from(parent.children).forEach(function (element) {
                if (element.tagName === "SCRIPT" || element.tagName === "STYLE" || element.tagName === "IFRAME" || element.tagName === "OBJECT") {
                    element.remove();
                    return;
                }

                if (element.tagName === "IMG") {
                    element.remove();
                    return;
                }

                clean(element);

                if (!allowedTags.has(element.tagName)) {
                    element.replaceWith(...Array.from(element.childNodes));
                    return;
                }

                Array.from(element.attributes).forEach(function (attribute) {
                    if (element.tagName !== "A" || attribute.name !== "href") {
                        element.removeAttribute(attribute.name);
                    }
                });

                if (element.tagName === "A") {
                    const href = element.getAttribute("href") || "";
                    if (!/^(https?:|mailto:)/i.test(href)) {
                        element.removeAttribute("href");
                    } else {
                        element.setAttribute("rel", "noopener noreferrer");
                    }
                }
            });
        }

        clean(documentFragment.body);
        return documentFragment.body.innerHTML;
    }

    function updateWordCount() {
        const words = fields.body.innerText.trim().split(/\s+/).filter(Boolean).length;
        wordCount.textContent = new Intl.NumberFormat("id-ID").format(words) + " kata";
    }

    function setCoverPreview(file) {
        if (coverObjectUrl) URL.revokeObjectURL(coverObjectUrl);
        coverObjectUrl = "";
        if (!file) {
            coverPreview.hidden = true;
            coverPreview.removeAttribute("src");
            return;
        }
        coverObjectUrl = URL.createObjectURL(file);
        coverPreview.src = coverObjectUrl;
        coverPreview.hidden = false;
    }

    function resetForm() {
        Object.keys(fields).forEach(function (key) {
            if (key === "body") fields.body.innerHTML = "";
            else fields[key].value = "";
        });
        coverFile.value = "";
        setCoverPreview(null);
        activeDraftKey = "";
        slugWasEdited = false;
        updateWordCount();
        renderDraftList();
        showMessage("Draf baru siap diisi. Impor Word atau mulai menulis di editor.");
    }

    function loadDraft(key) {
        const article = readDrafts()[key];
        if (!article) return;

        fields.title.value = article.title || "";
        fields.slug.value = article.slug || "";
        fields.category.value = article.category || "";
        fields.summary.value = article.summary || "";
        fields.description.value = article.description || "";
        fields.topics.value = Array.isArray(article.topics) ? article.topics.join(", ") : "";
        fields.body.innerHTML = sanitizeHtml(article.content || "");
        coverFile.value = "";
        setCoverPreview(null);
        activeDraftKey = key;
        slugWasEdited = true;
        updateWordCount();
        renderDraftList();
        showMessage("Draf dimuat dari penyimpanan browser ini.", "success");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function deleteDraft(key) {
        const drafts = readDrafts();
        const article = drafts[key];
        if (!article) return;

        const message = key === activeDraftKey
            ? "Hapus draf ini? Isi yang sedang terbuka di editor juga akan dikosongkan."
            : "Hapus draf ‘" + (article.title || "Artikel tanpa judul") + "’?";
        if (!window.confirm(message)) return;

        delete drafts[key];
        if (!writeDrafts(drafts)) return;
        if (key === activeDraftKey) resetForm();
        else {
            renderDraftList();
            showMessage("Draf berhasil dihapus.", "success");
        }
    }

    function renderDraftList() {
        const drafts = readDrafts();
        const entries = Object.entries(drafts).sort(function (left, right) {
            return String(right[1].updatedAt || "").localeCompare(String(left[1].updatedAt || ""));
        });
        draftCount.textContent = String(entries.length);
        draftList.replaceChildren();

        if (!entries.length) {
            const empty = document.createElement("p");
            empty.className = "empty-drafts";
            empty.textContent = "Belum ada draf tersimpan.";
            draftList.appendChild(empty);
            return;
        }

        entries.forEach(function ([key, article]) {
            const item = document.createElement("div");
            item.className = "draft-item" + (key === activeDraftKey ? " is-current" : "");
            const details = document.createElement("div");
            details.className = "draft-details";
            const title = document.createElement("strong");
            title.textContent = article.title || "Artikel tanpa judul";
            const meta = document.createElement("span");
            meta.textContent = article.category || "Tanpa kategori";
            details.append(title, meta);
            const actions = document.createElement("div");
            actions.className = "draft-actions";
            const edit = document.createElement("button");
            edit.type = "button";
            edit.className = "draft-edit";
            edit.textContent = "Edit";
            edit.addEventListener("click", function () { loadDraft(key); });
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "draft-delete";
            remove.textContent = "Hapus";
            remove.setAttribute("aria-label", "Hapus " + (article.title || "artikel tanpa judul"));
            remove.addEventListener("click", function () { deleteDraft(key); });
            actions.append(edit, remove);
            item.append(details, actions);
            draftList.appendChild(item);
        });
    }

    function saveDraft() {
        const article = collectArticle();
        if (!article.title || !article.slug || !article.category || !article.content) {
            showMessage("Lengkapi judul, slug, kategori, dan isi artikel terlebih dahulu.", "error");
            return;
        }

        const drafts = readDrafts();
        const key = activeDraftKey || article.slug;
        if (drafts[article.slug] && article.slug !== activeDraftKey) {
            showMessage("Slug ini sudah dipakai draf lain. Gunakan slug berbeda.", "error");
            return;
        }

        if (activeDraftKey && activeDraftKey !== article.slug) delete drafts[activeDraftKey];
        drafts[article.slug] = article;
        if (!writeDrafts(drafts)) return;
        activeDraftKey = article.slug;
        renderDraftList();
        showMessage("Draf berhasil disimpan di browser ini.", "success");
    }

    function downloadBlob(blob, filename) {
        const link = document.createElement("a");
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1000);
    }

    function downloadArticleJson() {
        const article = collectArticle();
        if (!article.title && !article.content) {
            showMessage("Isi artikel terlebih dahulu sebelum mengunduh data.", "error");
            return;
        }
        const filename = (article.slug || slugify(article.title) || "artikel") + ".json";
        const blob = new Blob([JSON.stringify(article, null, 2)], { type: "application/json;charset=utf-8" });
        downloadBlob(blob, filename);
        showMessage("Cadangan JSON diunduh. File ini belum bisa diimpor ke website secara otomatis.", "success");
    }

    function previewArticle() {
        const article = collectArticle();
        document.getElementById("previewTitleBar").textContent = article.title || "Artikel baru";
        document.getElementById("previewTitle").textContent = article.title || "Judul artikel";
        document.getElementById("previewCategory").textContent = article.category || "Kategori";
        document.getElementById("previewSummary").textContent = article.summary || "Ringkasan artikel akan tampil di sini.";
        document.getElementById("previewBody").innerHTML = article.content || "<p>Isi artikel akan tampil di sini.</p>";
        const previewCover = document.getElementById("previewCover");
        if (coverObjectUrl) {
            previewCover.src = coverObjectUrl;
            previewCover.hidden = false;
        } else {
            previewCover.hidden = true;
            previewCover.removeAttribute("src");
        }
        previewDialog.showModal();
    }

    async function importWord(file) {
        if (!file) return;
        if (!window.mammoth) {
            showMessage("Fitur impor Word belum termuat. Pastikan koneksi internet aktif, lalu muat ulang halaman.", "error");
            return;
        }
        if (!file.name.toLowerCase().endsWith(".docx")) {
            showMessage("Pilih file Word berformat .docx.", "error");
            return;
        }

        showMessage("Membaca dokumen Word…");
        try {
            const result = await window.mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() }, {
                styleMap: [
                    "p[style-name='Title'] => h1:fresh",
                    "p[style-name='Heading 1'] => h2:fresh",
                    "p[style-name='Heading 2'] => h3:fresh",
                ],
                externalFileAccess: false,
            });
            const parsed = new DOMParser().parseFromString(result.value, "text/html");
            const importedTitle = parsed.body.querySelector("h1");
            if (importedTitle && !fields.title.value.trim()) fields.title.value = importedTitle.textContent.trim();
            if (importedTitle) importedTitle.remove();
            fields.body.innerHTML = sanitizeHtml(parsed.body.innerHTML);
            if (fields.body.querySelector("p") && !fields.body.querySelector(".article-intro")) {
                fields.body.querySelector("p").classList.add("article-intro");
            }
            if (!slugWasEdited && fields.title.value) fields.slug.value = slugify(fields.title.value);
            updateWordCount();
            const containsImages = /<img\b/i.test(result.value);
            const warningCount = result.messages.length;
            const notes = [];
            if (containsImages) notes.push("gambar dari Word dilewati; pilih foto sampul secara terpisah");
            if (warningCount) notes.push(warningCount + " catatan format diabaikan");
            showMessage("Dokumen berhasil diimpor." + (notes.length ? " " + notes.join("; ") + "." : " Periksa kembali heading dan formatnya."), "success");
        } catch (error) {
            showMessage("Dokumen gagal dibaca. Coba simpan ulang sebagai .docx dari Microsoft Word.", "error");
        }
    }

    function inlineWordRuns(node, marks) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.nodeValue) return [];
            return [new docx.TextRun({
                text: node.nodeValue,
                bold: Boolean(marks.bold),
                italics: Boolean(marks.italics),
                underline: marks.underline ? {} : undefined,
            })];
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return [];
        const nextMarks = {
            bold: marks.bold || node.tagName === "STRONG" || node.tagName === "B",
            italics: marks.italics || node.tagName === "EM" || node.tagName === "I",
            underline: marks.underline || node.tagName === "U",
        };
        return Array.from(node.childNodes).flatMap(function (child) {
            return inlineWordRuns(child, nextMarks);
        });
    }

    async function exportWord() {
        if (!window.docx) {
            showMessage("Fitur ekspor Word belum termuat. Pastikan koneksi internet aktif, lalu muat ulang halaman.", "error");
            return;
        }
        const article = collectArticle();
        if (!article.title && !article.content) {
            showMessage("Isi artikel terlebih dahulu sebelum mengekspor Word.", "error");
            return;
        }

        const children = [new docx.Paragraph({ text: article.title || "Artikel tanpa judul", heading: docx.HeadingLevel.TITLE })];
        if (article.category) children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: article.category.toUpperCase(), bold: true })] }));
        if (article.summary) children.push(new docx.Paragraph({ children: [new docx.TextRun({ text: article.summary, italics: true })] }));

        Array.from(fields.body.children).forEach(function (element) {
            const runs = Array.from(element.childNodes).flatMap(function (node) {
                return inlineWordRuns(node, {});
            });
            if (!runs.length) return;

            if (element.tagName === "H2" || element.tagName === "H3") {
                children.push(new docx.Paragraph({
                    children: runs,
                    heading: element.tagName === "H2" ? docx.HeadingLevel.HEADING_1 : docx.HeadingLevel.HEADING_2,
                }));
            } else if (element.tagName === "LI") {
                children.push(new docx.Paragraph({ children: [new docx.TextRun("• "), ...runs] }));
            } else if (element.tagName === "BLOCKQUOTE") {
                children.push(new docx.Paragraph({ children: runs, style: "Quote" }));
            } else {
                children.push(new docx.Paragraph({ children: runs }));
            }
        });

        try {
            const documentFile = new docx.Document({ sections: [{ children }] });
            const blob = await docx.Packer.toBlob(documentFile);
            downloadBlob(blob, (article.slug || slugify(article.title) || "artikel") + ".docx");
            showMessage("File Word berhasil dibuat. Ekspor ini untuk arsip/review, bukan menerbitkan artikel.", "success");
        } catch (error) {
            showMessage("File Word gagal dibuat. Coba muat ulang halaman lalu ekspor kembali.", "error");
        }
    }

    document.querySelectorAll(".editor-toolbar [data-command]").forEach(function (button) {
        button.addEventListener("mousedown", function (event) { event.preventDefault(); });
        button.addEventListener("click", function () {
            fields.body.focus();
            const command = button.dataset.command;
            const value = button.dataset.value;
            document.execCommand(command, false, value ? "<" + value + ">" : undefined);
            updateWordCount();
        });
    });

    fields.body.addEventListener("input", updateWordCount);
    fields.title.addEventListener("input", function () {
        if (!slugWasEdited) fields.slug.value = slugify(fields.title.value);
    });
    fields.slug.addEventListener("input", function () {
        slugWasEdited = true;
        fields.slug.value = slugify(fields.slug.value);
    });

    coverFile.addEventListener("change", function () {
        const file = coverFile.files && coverFile.files[0];
        setCoverPreview(file);
        if (file && file.size > 5 * 1024 * 1024) {
            showMessage("Foto berukuran lebih dari 5 MB. Pratinjau saja; perkecil sebelum diterbitkan.", "error");
        }
    });

    document.getElementById("wordFile").addEventListener("change", function (event) {
        importWord(event.target.files && event.target.files[0]);
        event.target.value = "";
    });
    document.getElementById("saveDraftButton").addEventListener("click", saveDraft);
    document.getElementById("previewButton").addEventListener("click", previewArticle);
    document.getElementById("exportWordButton").addEventListener("click", exportWord);
    document.getElementById("downloadJsonButton").addEventListener("click", downloadArticleJson);
    document.getElementById("newArticleButton").addEventListener("click", resetForm);
    document.getElementById("closePreviewButton").addEventListener("click", function () { previewDialog.close(); });
    document.getElementById("downloadTemplateButton").addEventListener("click", async function () {
        if (!window.docx) {
            showMessage("Fitur template Word belum termuat. Pastikan koneksi internet aktif, lalu muat ulang halaman.", "error");
            return;
        }
        const children = [
            new docx.Paragraph({ text: "TULIS JUDUL ARTIKEL DI SINI", heading: docx.HeadingLevel.TITLE }),
            new docx.Paragraph({ text: "Ganti teks petunjuk dengan judul, lalu hapus teks di dalam tanda kurung." }),
            new docx.Paragraph({ text: "Pendahuluan", heading: docx.HeadingLevel.HEADING_1 }),
            new docx.Paragraph("Tulis paragraf pembuka di sini."),
            new docx.Paragraph({ text: "Subjudul berikutnya", heading: docx.HeadingLevel.HEADING_1 }),
            new docx.Paragraph("Tulis penjelasan dan langkah praktis di sini."),
            new docx.Paragraph({ text: "Kesimpulan", heading: docx.HeadingLevel.HEADING_1 }),
            new docx.Paragraph("Ringkas pembahasan dan langkah berikutnya di sini."),
        ];
        try {
            const template = new docx.Document({ sections: [{ children }] });
            downloadBlob(await docx.Packer.toBlob(template), "template-artikel-sinergi.docx");
            showMessage("Template Word berhasil diunduh. Isi menggunakan gaya Title, Heading 1, dan Normal.", "success");
        } catch (error) {
            showMessage("Template Word gagal dibuat. Coba muat ulang halaman.", "error");
        }
    });

    renderDraftList();
    updateWordCount();
})();
