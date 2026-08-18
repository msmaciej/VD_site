<?php
/**
 * fitcheck-profiles.gen.php  —  GENERATED FILE. DO NOT EDIT BY HAND.
 *
 * Source of truth: src/content/fitcheck/config.json  ("profiles" section,
 * edited in TinaCMS). Regenerate with:
 *     node scripts/gen-fitcheck-profiles.mjs
 * which runs automatically as the first step of `npm run build`.
 *
 * Any edit you make here is overwritten on the next build. Change the copy
 * in config.json / Tina instead.
 * Generated: 2026-08-18T19:21:16.118Z
 */

$PROFILES = [
    'en' => [
        'fireFight' => [
            'name' => 'FireFight',
            'tagline' => 'You\'re spending real hours firefighting, with no clear process to fall back on.',
            'description' => 'Right now, this work eats a real chunk of your week — and without a defined process, it likely falls on whoever has time, which makes it inconsistent as well as slow. This is usually the fastest area to see a return from automating, because the fix doesn\'t require redesigning how you work — it just needs the parts that already repeat to stop needing a person.',
        ],
        'refine' => [
            'name' => 'Refine',
            'tagline' => 'You already have a process — it\'s just not fast enough.',
            'description' => 'You\'ve done the harder work already: there\'s a defined way this gets done. The cost now is mostly speed and consistency, not structure. That\'s usually a more contained automation project than it looks — the logic already exists, it just needs to run without someone executing it by hand every time.',
        ],
        'build' => [
            'name' => 'Build',
            'tagline' => 'The time cost is manageable for now — but there\'s no real process underneath it.',
            'description' => 'This isn\'t costing you many hours yet, which is exactly why it\'s easy to leave as-is. But without a defined process, it tends to get worse as volume grows, not better. Worth thinking about before it becomes the next FireFight.',
        ],
        'optimize' => [
            'name' => 'Optimize',
            'tagline' => 'This is already working reasonably well.',
            'description' => 'You have both a defined process and a manageable time cost — this is closer to fine-tuning than fixing. Automation here is about removing friction and freeing up the last bit of manual effort, not solving a broken workflow. Even solid setups like this usually still have room for effective automation — small frictions worth removing, processes worth tightening, and time, money, or other resources worth freeing up that are easy to overlook when things already work.',
        ],
    ],
    'de' => [
        'fireFight' => [
            'name' => 'FireFight',
            'tagline' => 'Sie investieren im Moment echte Stunden ins Feuerlöschen – ohne klaren Ablauf im Hintergrund.',
            'description' => 'Dieser Bereich kostet aktuell einen spürbaren Teil Ihrer Woche – und da kein definierter Ablauf existiert, übernimmt es meist, wer gerade Zeit hat. Das macht es zusätzlich uneinheitlich. Das ist in der Regel der Bereich, in dem sich Automatisierung am schnellsten auszahlt, denn es braucht keine grundlegende Neugestaltung – nur die bereits wiederkehrenden Schritte müssen nicht mehr manuell erledigt werden.',
        ],
        'refine' => [
            'name' => 'Refine',
            'tagline' => 'Sie haben bereits einen Ablauf – er ist nur noch nicht schnell genug.',
            'description' => 'Die schwierigere Arbeit ist bereits getan: Es gibt einen definierten Ablauf. Der Aufwand liegt jetzt vor allem bei Geschwindigkeit und Konsistenz, nicht bei der Struktur. Das ist meist ein überschaubareres Automatisierungsprojekt, als es aussieht – die Logik existiert bereits, sie muss nur nicht mehr jedes Mal von Hand ausgeführt werden.',
        ],
        'build' => [
            'name' => 'Build',
            'tagline' => 'Der Zeitaufwand ist im Moment überschaubar – aber es fehlt ein echter Ablauf dahinter.',
            'description' => 'Aktuell kostet das noch nicht viele Stunden, was es leicht macht, es einfach so zu belassen. Ohne definierten Ablauf wird es mit wachsendem Volumen aber eher schlimmer als besser. Das lohnt sich, bevor daraus das nächste FireFight wird.',
        ],
        'optimize' => [
            'name' => 'Optimize',
            'tagline' => 'Das läuft bereits vergleichsweise gut.',
            'description' => 'Sie haben sowohl einen definierten Ablauf als auch einen überschaubaren Zeitaufwand – hier geht es eher um Feinschliff als um Reparatur. Automatisierung bedeutet hier, Reibung zu reduzieren und den letzten manuellen Aufwand abzubauen, nicht einen kaputten Prozess zu retten. Auch bei einer so soliden Ausgangslage gibt es meist noch Raum für sinnvolle Automatisierung – kleine Reibungspunkte, die sich beseitigen lassen, Abläufe, die sich weiter verschlanken lassen, sowie Zeit, Geld oder andere Ressourcen, die sich freisetzen lassen und bei bereits funktionierenden Prozessen leicht übersehen werden.',
        ],
    ],
];

$RESULT_SHARED = [
    'en' => [
        'disclaimer' => 'This result is based on a handful of quick answers — a useful starting point, not a full diagnosis. If something here doesn\'t quite match your situation, or you\'d like a clearer picture, a short conversation is the fastest way to get one.',
        'ctaLabel' => 'Let\'s talk it through',
    ],
    'de' => [
        'disclaimer' => 'Dieses Ergebnis basiert auf wenigen kurzen Antworten – ein hilfreicher erster Anhaltspunkt, keine vollständige Diagnose. Falls etwas hier nicht ganz zu Ihrer Situation passt, oder Sie ein klareres Bild wünschen, ist ein kurzes Gespräch der schnellste Weg dazu.',
        'ctaLabel' => 'Lassen Sie uns kurz darüber sprechen',
    ],
];

$CONFIRM_UI = [
    'en' => [
        'emailSubject' => 'Your VortexDeep Fit Check result',
        'emailBody' => 'You\'ve finished the Fit Check. | To see your result, confirm this is your address by opening the link below: | {{LINK}} | The link stays valid for 30 minutes. If you didn\'t run the Fit Check, you can ignore this email — nothing further will happen.',
        'confirmHeading' => 'One tap to confirm',
        'confirmBody' => 'One tap confirms the address is yours. Your result then appears right here.',
        'confirmButton' => 'See my result',
        'resultTag' => 'Your result',
        'expiredHeading' => 'This link has expired',
        'expiredBody' => 'Fit Check links stay valid for 30 minutes. Start the check again to get a fresh one.',
        'backLabel' => 'Back to the Fit Check',
    ],
    'de' => [
        'emailSubject' => 'Ihr VortexDeep Fit-Check-Ergebnis',
        'emailBody' => 'Sie haben den Fit Check abgeschlossen. | Um Ihr Ergebnis zu sehen, bestätigen Sie über den folgenden Link, dass dies Ihre Adresse ist: | {{LINK}} | Der Link gilt 30 Minuten. Falls Sie den Fit Check nicht gemacht haben, können Sie diese E-Mail ignorieren – es passiert nichts weiter.',
        'confirmHeading' => 'Noch eine Bestätigung',
        'confirmBody' => 'Ein Klick bestätigt, dass die Adresse Ihnen gehört. Danach erscheint hier Ihr Ergebnis.',
        'confirmButton' => 'Mein Ergebnis sehen',
        'resultTag' => 'Ihr Ergebnis',
        'expiredHeading' => 'Dieser Link ist abgelaufen',
        'expiredBody' => 'Fit-Check-Links gelten 30 Minuten. Starten Sie den Check neu, um einen frischen Link zu erhalten.',
        'backLabel' => 'Zurück zum Fit Check',
    ],
];

$FITCHECK_THEME = [
    'bg' => '#F9F7F2',
    'text' => '#0a0a0a',
    'muted' => '#737373',
    'accent' => '#0a0a0a',
    'font' => '\'IBM Plex Mono\', monospace',
];
