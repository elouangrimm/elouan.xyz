document.addEventListener("DOMContentLoaded", () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Elouan Grimm",
        "url": "https://elouan.xyz",
        "sameAs": [
            "https://github.com/elouangrimm",
            "https://bsky.app/profile/elouan.xyz",
            "https://discord.com/users/939697576419131462"
        ],
        "jobTitle": "Web Developer",
        "worksFor": {
            "@type": "Organization",
            "name": "Self-Employed"
        },
        "description": "Elouan Grimm is a web developer based in Saint Nazaire, France, passionate about Open Source and HTML5."
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
});
