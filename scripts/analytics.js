// PostHog Analytics Initialization
// This script initializes PostHog analytics for tracking
!(function (e, t) {
    var s, r, o, i;
    t.__SV ||
        ((window.posthog = t),
        (t._i = []),
        (t.init = function (n, a, p) {
            function g(e, t) {
                var s = t.split(".");
                (2 == s.length && ((e = e[s[0]]), (t = s[1])),
                    (e[t] = function () {
                        e.push(
                            [t].concat(
                                Array.prototype.slice.call(arguments, 0),
                            ),
                        );
                    }));
            }
            (((o = e.createElement("script")).type = "text/javascript"),
                (o.crossOrigin = "anonymous"),
                (o.async = !0),
                (o.src =
                    a.api_host.replace(
                        ".i.posthog.com",
                        "-assets.i.posthog.com",
                    ) + "/static/array.js"),
                (o.onerror = function () {
                    console.log(
                        "%c↑↑↑ good on you for using an ad blocker... sorry for even trying to track you in the first place %c😉\n\n\n\n",
                        "font-style: italic; font-size: 1.25em;",
                        "font-style: none; font-size: 1.25em;",
                    );
                }),
                (i =
                    e.getElementsByTagName(
                        "script",
                    )[0]).parentNode.insertBefore(o, i));
            var c = t;
            for (
                void 0 !== p ? (c = t[p] = []) : (p = "posthog"),
                    c.people = c.people || [],
                    c.toString = function (e) {
                        var t = "posthog";
                        return (
                            "posthog" !== p && (t += "." + p),
                            e || (t += " (stub)"),
                            t
                        );
                    },
                    c.people.toString = function () {
                        return c.toString(1) + ".people (stub)";
                    },
                    s =
                        "init bs ws ge fs capture De Ai $s register register_once register_for_session unregister unregister_for_session Is getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty xs Ss createPersonProfile Es gs opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing ys debug ks getPageViewId captureTraceFeedback captureTraceMetric".split(
                            " ",
                        ),
                    r = 0;
                r < s.length;
                r++
            )
                g(c, s[r]);
            t._i.push([n, a, p]);
        }),
        (t.__SV = 1));
})(document, window.posthog || []);

posthog.init("phc_W4DPbbp1Qbz4lPVtWrFF54GFUabBHpKzNJx9U6fryBZ", {
    api_host: "https://posthog.elouan.xyz/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "always",
});

fetch("/manifest.json")
    .then((r) => r.json());

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(function () {
        // === welcome banner ===
        const _3d = (color, shadow) =>
            `font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', 'Cascadia Code', monospace; font-size: 3em; font-weight: 700; color: ${color}; text-shadow: 1px 1px 1px ${shadow}, 1px 2px 1px ${shadow}, 1px 3px 1px ${shadow}, 1px 4px 1px ${shadow}, 1px 5px 1px ${shadow}, 1px 13px 6px rgba(16,16,16,0.4), 1px 22px 10px rgba(16,16,16,0.2), 1px 25px 35px rgba(16,16,16,0.2), 1px 30px 60px rgba(16,16,16,0.4); padding: 10px 0`
        console.log(
            "%cwelcome to %ce%cl%co%cu%ca%cn%c.%cx%cy%cz \n%cand the dev tools",
            _3d("#4680ff", "#1c50be"),
            _3d("#ff6b6b", "#8b2e2e"),
            _3d("#ffa94d", "#7a4e1a"),
            _3d("#ffd43b", "#7a6010"),
            _3d("#69db7c", "#2a6b38"),
            _3d("#4dabf7", "#1a5a8a"),
            _3d("#748ffc", "#2a3a8a"),
            _3d("#9775fa", "#3d2a7a"),
            _3d("#da77f2", "#6a2a7a"),
            _3d("#f783ac", "#7a2a4a"),
            _3d("#ff6b6b", "#8b2e2e"),
            "position: absolute; top: 50%; right: 50%; transform: translate(50%,-50%); font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', 'Cascadia Code', monospace; font-size: 2em; font-weight: 700; font-style: italic; color: #f59e0b; text-shadow: 1px 1px 1px #72582a, 1px 2px 1px #72582a, 1px 3px 1px #72582a, 1px 4px 1px #72582a, 1px 5px 1px #72582a, 1px 13px 6px rgba(16,16,16,0.4), 1px 22px 10px rgba(16,16,16,0.2), 1px 25px 35px rgba(16,16,16,0.2), 1px 30px 60px rgba(16,16,16,0.4);padding:10px",
        )

        console.log("\n \n \n")

        // === site stats table ===
        console.log("%csite info:", "color: #4680ff; font-family: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', 'Cascadia Code', monospace; font-size: 1.5em; font-weight: bold; border-bottom: 2px solid #4680ff; padding-bottom: 2px")
        console.table({
            "stack":     { value: "HTML + CSS + vanilla JS" },
            "hosting":   { value: "Vercel" },
            "analytics": { value: "PostHog" },
            "framework": { value: "none. raw dogging it." },
            "source": { value: "github.com/elouangrimm/elouan.xyz" },

        })

    }, 500)
});