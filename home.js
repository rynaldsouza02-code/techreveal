/**
 * Tech Manthan 6.0 - Official Home Portal & Interactive Voice Reader
 */

const defaultEvents = [
    {
        id: "coding",
        title: "Coding",
        icon: "🎮",
        description: "Create your own world. Solve algorithmic puzzles and write clean code to win the ultimate prize.",
        venue: "Research Lab",
        date: "22/08/2026",
        time: "12:30 PM - 02:00 PM"
    },
    {
        id: "cultural",
        title: "Group Dance",
        icon: "💃",
        description: "Your time to shine. Showcase technical skits, digital presentations, or creative dances.",
        venue: "Auditorium",
        date: "22/08/2026",
        time: "12:30 PM - 02:00 PM"
    },
    {
        id: "gaming",
        title: "Gaming",
        icon: "🕹️",
        description: "Show the spirit. Compete head-to-head in competitive multiplayer tournaments.",
        venue: "Lab 1",
        date: "12/08/2026 - 14/08/2026",
        time: "03:00 PM"
    },
    {
        id: "it-manager",
        title: "Best IT Manager",
        icon: "👔",
        description: "Corporate tech survival. Test your management, crisis resolution, and executive pitching skills.",
        venue: "Auditorium / Room 205",
        date: "22/08/2026",
        time: "02:00 PM - 03:00 PM"
    },
    {
        id: "treasure-hunt",
        title: "Treasure Hunt",
        icon: "🗺️",
        description: "Decrypt the clues. Crack cryptographic hashes and riddles across the campus to locate the flag.",
        venue: "Room 204",
        date: "22/08/2026",
        time: "11:00 AM"
    },
    {
        id: "tech-quiz",
        title: "Tech Quiz",
        icon: "🧠",
        description: "Brain vs Machine. The ultimate trivia battle covering computer history, networks, and syntax.",
        venue: "Auditorium",
        date: "22/08/2026",
        time: "11:00 AM - 12:00 PM"
    },
    {
        id: "photography",
        title: "Photography",
        icon: "📸",
        description: "Capture every moment. Submit the best click capturing the cyberpunk essence of our festival.",
        venue: "Lab 1 Submission",
        date: "22/08/2026",
        time: "09:00 AM - 02:00 PM"
    },
    {
        id: "videography",
        title: "Videography",
        icon: "🎬",
        description: "Reel into reels. Shoot and edit a cinematic reel capturing the energy of Tech Manthan.",
        venue: "Research Lab Submission",
        date: "22/08/2026",
        time: "Submission by 22-08-2026"
    },
    {
        id: "poster-making",
        title: "Poster Making",
        icon: "🎨",
        description: "Design the future. Create a digital or physical flyer representing the core tech event vision.",
        venue: "Research Lab",
        date: "11/08/2026",
        time: "03:00 PM"
    },
    {
        id: "ungoogling",
        title: "Ungoogling",
        icon: "🔍",
        description: "Find answers without using the search giant. Navigate alternative portals to crack clues.",
        venue: "Research Lab",
        date: "22/08/2026",
        time: "10:00 AM - 11:30 AM"
    },
    {
        id: "speed-typing",
        title: "Speed Typing",
        icon: "⌨️",
        description: "Test your WPM limit under intense pressure. Fast and accurate keyboarding competition.",
        venue: "Research Lab",
        date: "10/08/2026",
        time: "03:00 PM"
    },
    {
        id: "it-model",
        title: "IT Model & PPT",
        icon: "🖥️",
        description: "Build the hardware of tomorrow. Showcase working models of modern technological frameworks.",
        venue: "Room 205",
        date: "19/08/2026",
        time: "03:00 PM"
    }
];

let lastSpokenTitle = "";

function speakCardNarration(title, description) {
    if (!('speechSynthesis' in window)) return;

    if (lastSpokenTitle === title && window.speechSynthesis.speaking) return;
    lastSpokenTitle = title;

    try {
        window.speechSynthesis.cancel();
        const text = `${title}. ${description}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang && v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Samantha')));
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    } catch (e) {}
}

function renderEventsCatalog() {
    const grid = document.getElementById("eventGrid");
    if (!grid) return;

    grid.innerHTML = defaultEvents.map(ev => `
        <div class="event-card cyber-card-hover" id="card-${ev.id}" 
             style="background: rgba(10, 15, 30, 0.85); border: 1.5px solid rgba(0, 243, 255, 0.25); border-radius: 16px; padding: 22px; transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1); cursor: pointer; position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="font-size: 2.2rem; margin-bottom: 10px;">${ev.icon}</div>
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.25rem; color: var(--neon-cyan); margin-bottom: 8px; letter-spacing: 1px;">${ev.title}</h3>
                <p class="event-desc" style="font-family: 'Rajdhani', sans-serif; color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin-bottom: 15px;">${ev.description}</p>
            </div>
            
            <div style="border-top: 1px solid rgba(0, 243, 255, 0.15); padding-top: 12px; font-family: 'Rajdhani', sans-serif; font-size: 0.85rem; color: var(--text-sub);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>📅 <strong>Date:</strong> ${ev.date}</span>
                    <span>🕒 <strong>Time:</strong> ${ev.time}</span>
                </div>
                <div>📍 <strong>Venue:</strong> ${ev.venue}</div>
            </div>
        </div>
    `).join("");

    // Attach mouseenter hover event listener to every card for instant narration
    defaultEvents.forEach(ev => {
        const cardEl = document.getElementById(`card-${ev.id}`);
        if (cardEl) {
            cardEl.addEventListener("mouseenter", () => {
                cardEl.style.borderColor = "var(--neon-cyan)";
                cardEl.style.boxShadow = "0 0 30px rgba(0, 243, 255, 0.4), inset 0 0 15px rgba(0, 243, 255, 0.15)";
                cardEl.style.transform = "translateY(-6px) scale(1.02)";
                
                speakCardNarration(ev.title, ev.description);
            });

            cardEl.addEventListener("mouseleave", () => {
                cardEl.style.borderColor = "rgba(0, 243, 255, 0.25)";
                cardEl.style.boxShadow = "none";
                cardEl.style.transform = "translateY(0) scale(1)";
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderEventsCatalog();
});
