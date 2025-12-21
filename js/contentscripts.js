(function() {
    var DEBUG = true;

    var onKeyDown = function(event) {
        // Push "w" key (without modifiers to avoid conflicts)
        if (event.keyCode == 87 && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
            if (DEBUG) console.log("Inoreader Star Opener: 'w' key detected!");

            // Ignore if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
                if (DEBUG) console.log("Inoreader Star Opener: Ignored - user is typing in an input field");
                return;
            }

            chrome.runtime.sendMessage({method: "getOptions"}, function(response) {
                var tab_count = response.iso_tabcount;

                if (DEBUG) console.log("Inoreader Star Opener: Opening up to " + tab_count + " tabs");

                // Inoreader uses different selectors - these will need to be verified
                // This is a placeholder that should work with common Inoreader layouts

                // Try to find article links in starred items
                // Inoreader typically uses classes like 'article_title_link' or similar
                var possibleSelectors = [
                    'a.article_magazine_title_link',  // Magazine view title link
                    'a.article_title_link',  // Common selector for article links
                    'a.article_link',
                    '.article_item a[href^="http"]',
                    '.article a.article_title'
                ];

                var articles = [];

                // Try each selector until we find articles
                for (var selectorIndex = 0; selectorIndex < possibleSelectors.length; selectorIndex++) {
                    if (DEBUG) console.log("Trying selector: " + possibleSelectors[selectorIndex]);
                    var links = document.querySelectorAll(possibleSelectors[selectorIndex]);
                    if (DEBUG) console.log("  -> Found " + links.length + " links");
                    if (links.length > 0) {
                        if (DEBUG) console.log("Found " + links.length + " links using selector: " + possibleSelectors[selectorIndex]);

                        // Filter to get unique articles
                        var seenUrls = new Set();
                        for (var i = 0; i < links.length && articles.length < tab_count; i++) {
                            var link = links[i];
                            var url = link.href;

                            // Skip if we've already seen this URL or if it's not a valid http(s) URL
                            if (seenUrls.has(url) || (!url.startsWith('http://') && !url.startsWith('https://'))) {
                                continue;
                            }

                            seenUrls.add(url);
                            articles.push({
                                url: url,
                                title: link.textContent.trim()
                            });
                        }

                        if (articles.length > 0) {
                            break;  // Found articles, no need to try other selectors
                        }
                    }
                }

                if (articles.length === 0) {
                    console.warn("Inoreader Star Opener: No articles found. Please check the page structure.");

                    // Fallback: try to find any links that might be articles
                    var allLinks = document.querySelectorAll('a[href^="http"]');
                    console.log("Inoreader Star Opener: Fallback - found " + allLinks.length + " total http(s) links on page");

                    // Also try to find all links
                    var allLinksAny = document.querySelectorAll('a');
                    console.log("Inoreader Star Opener: Total <a> tags on page: " + allLinksAny.length);

                    // Log some links for debugging
                    if (allLinks.length > 0) {
                        console.log("Sample http(s) links (first 10):");
                        for (var j = 0; j < Math.min(10, allLinks.length); j++) {
                            var link = allLinks[j];
                            console.log("  [" + j + "] class='" + link.className + "' href='" + link.href + "'");
                            console.log("      text: " + link.textContent.trim().substring(0, 50));
                        }
                    }
                } else {
                    if (DEBUG) console.log("Opening " + articles.length + " articles");

                    // Open articles in background tabs
                    for (var k = 0; k < articles.length; k++) {
                        window.open(articles[k].url);
                    }
                }
            });
        }
    };

    document.addEventListener('keydown', onKeyDown, false);

    if (DEBUG) console.log("Inoreader Star Opener: Content script loaded");
})();
