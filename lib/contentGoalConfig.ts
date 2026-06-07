export type ContentGoalConfig = {
  id: string;
  label: string;
  primaryGoal: string;
  audienceOutcome: string;
  structure: string[];
  emphasize: string[];
  avoid: string[];
  ctaStyle: string[];
  hookStyle: string;
  emotionalTone: string;
  templateDirection: string;
};

export const CONTENT_GOAL_CONFIGS: ContentGoalConfig[] = [
  {
    id: "leads",
    label: "Leads",
    primaryGoal: "Generate inquiries.",
    audienceOutcome: "I may need help.",
    structure: ["problem recognition", "emotional validation", "solution possibility", "invitation to connect"],
    emphasize: ["pain points", "hope", "therapy benefits", "next steps"],
    avoid: ["aggressive selling", "fear tactics"],
    ctaStyle: ["Learn more", "Reach out", "Schedule a consultation"],
    hookStyle: "Use a problem-aware hook that names a real pain point and opens the door to support.",
    emotionalTone: "warm, validating, reassuring, gently conversion-aware",
    templateDirection: "Use a trust-building carousel, service explainer, first-session explainer, or consultation CTA layout."
  },
  {
    id: "education",
    label: "Education",
    primaryGoal: "Teach something useful.",
    audienceOutcome: "I learned something I did not know.",
    structure: ["hook", "explanation", "example", "practical takeaway", "save CTA"],
    emphasize: ["psychology", "nervous system education", "therapist insights", "myths vs facts", "real-world examples"],
    avoid: ["sales language", "generic motivation", "inspirational fluff", "therapy promotion"],
    ctaStyle: ["Save this for later", "Share with someone who needs this", "Follow for more mental health education"],
    hookStyle: "Use a clear teaching hook that explains a pattern, answers a question, or corrects a misconception.",
    emotionalTone: "clear, useful, grounded, clinically informed",
    templateDirection: "Use an educational carousel, nervous system infographic, myth-vs-fact post, or blog graphic."
  },
  {
    id: "trust-building",
    label: "Trust-building",
    primaryGoal: "Demonstrate expertise and clinical understanding.",
    audienceOutcome: "This therapist really gets it.",
    structure: ["relatable observation", "clinical insight", "explanation", "gentle guidance", "save/follow CTA"],
    emphasize: ["therapist perspective", "hidden meanings behind behavior", "emotional nuance", "parent education", "client experiences without violating privacy"],
    avoid: ["workbook promotion", "hard selling", "generic wellness advice", "broad reassurance", "you are not alone"],
    ctaStyle: ["Save if this helped you understand the pattern", "Share with a parent, partner, or client who needs language for this"],
    hookStyle: "Use a validating hook that names a concrete behavior, hidden symptom, body cue, or real-life moment before giving clinical context.",
    emotionalTone: "emotionally intelligent, nuanced, safe, therapist-authored",
    templateDirection: "Use an Emotional Hook Carousel, Therapist Education Carousel, quote post, or warm reflection template."
  },
  {
    id: "promotion",
    label: "Promotion",
    primaryGoal: "Promote a service, product, offer, or resource.",
    audienceOutcome: "This offer might help me with something specific.",
    structure: ["specific pain point", "offer context", "benefit", "what to do next"],
    emphasize: ["offer clarity", "practical benefit", "specific use case", "ethical urgency"],
    avoid: ["fear tactics", "overpromising", "generic sale language"],
    ctaStyle: ["Learn more", "Shop now", "Book a consultation", "Download the resource"],
    hookStyle: "Use a benefit-led hook that connects the offer to a specific emotional or practical problem.",
    emotionalTone: "clear, supportive, benefit-led, not pushy",
    templateDirection: "Use a product promo, workbook promo, service promo, or clean offer-focused layout."
  },
  {
    id: "testimonials",
    label: "Testimonials",
    primaryGoal: "Build credibility through transformation.",
    audienceOutcome: "Change feels possible.",
    structure: ["before", "turning point", "after", "takeaway"],
    emphasize: ["outcomes", "emotional shifts", "transformation"],
    avoid: ["unrealistic promises", "exaggerated claims"],
    ctaStyle: ["Imagine what is possible", "Learn more"],
    hookStyle: "Use a credibility hook focused on a believable transformation or emotional shift.",
    emotionalTone: "credible, hopeful, careful, grounded",
    templateDirection: "Use a testimonial-style card, story post, transformation carousel, or trust-building layout."
  },
  {
    id: "awareness",
    label: "Awareness",
    primaryGoal: "Increase recognition of a problem.",
    audienceOutcome: "I did not realize this was anxiety, trauma, burnout, or another mental health pattern.",
    structure: ["hook", "signs/symptoms", "explanation", "recognition moment", "share CTA"],
    emphasize: ["overlooked symptoms", "hidden patterns", "common misconceptions", "early warning signs"],
    avoid: ["deep teaching", "heavy sales"],
    ctaStyle: ["Share with someone who may need this", "Did any of these surprise you?"],
    hookStyle: "Use a recognition hook that reveals an overlooked sign or pattern.",
    emotionalTone: "accessible, validating, gently eye-opening",
    templateDirection: "Use an awareness carousel, symptom-list graphic, infographic, or broad recognition post."
  },
  {
    id: "engagement",
    label: "Engagement",
    primaryGoal: "Generate comments.",
    audienceOutcome: "I need to respond to this.",
    structure: ["strong opinion", "relatable example", "reflection question", "comment CTA"],
    emphasize: ["conversation starters", "controversial-but-safe takes", "identity-based questions"],
    avoid: ["educational lectures", "long explanations"],
    ctaStyle: ["Which one are you?", "Comment below", "What is your experience?"],
    hookStyle: "Use a conversational hook with a safe tension, identity prompt, or sharp reflection question.",
    emotionalTone: "direct, conversational, socially current, clinically safe",
    templateDirection: "Use a discussion-style carousel, Threads prompt, story poll, or short-form social card."
  },
  {
    id: "follower-growth",
    label: "Follower-growth",
    primaryGoal: "Earn follows.",
    audienceOutcome: "This account understands me.",
    structure: ["hyper-relatable hook", "emotional recognition", "short insight", "follow CTA"],
    emphasize: ["emotionally specific experiences", "scroll-stopping hooks", "highly relatable thoughts"],
    avoid: ["long educational content", "heavy promotion", "broad clinical questions", "generic wellness filler"],
    ctaStyle: ["save this if it felt familiar", "send this to someone who overthinks every tone shift", "follow @LHtherapy for emotionally honest mental health content"],
    hookStyle: "Use a tiny lived-moment hook with body cues, inner dialogue, or a relationship trigger. Avoid broad questions.",
    emotionalTone: "social-native, warm, highly relatable, trauma-informed, not salesy",
    templateDirection: "Use an Emotional Hook Carousel, creator-native carousel, text-message style post, Reel cover, or recognition-based Canva template."
  },
  {
    id: "saves",
    label: "Saves",
    primaryGoal: "Generate saves.",
    audienceOutcome: "I need this later.",
    structure: ["problem", "solution", "framework", "action steps", "save CTA"],
    emphasize: ["checklists", "scripts", "coping tools", "worksheets", "step-by-step methods"],
    avoid: ["storytelling", "vague advice"],
    ctaStyle: ["Save this for later", "Keep this handy"],
    hookStyle: "Use a practical hook that promises a useful framework, checklist, script, or repeatable tool.",
    emotionalTone: "practical, calming, useful, clear",
    templateDirection: "Use a checklist carousel, coping tool graphic, worksheet-style post, or Pinterest infographic."
  },
  {
    id: "shares",
    label: "Shares",
    primaryGoal: "Generate shares.",
    audienceOutcome: "This reminds me of someone.",
    structure: ["recognition hook", "explanation", "validation", "share CTA"],
    emphasize: ["relationships", "parenting", "friendships", "common experiences"],
    avoid: ["dense educational content"],
    ctaStyle: ["Send this to someone who needs it", "Share with a parent, friend, or partner"],
    hookStyle: "Use a recognition hook that makes the reader think of another person or relationship dynamic.",
    emotionalTone: "relational, validating, concise, shareable",
    templateDirection: "Use a quote post, recognition carousel, emotional hook carousel, or text-message style layout."
  },
  {
    id: "reach-awareness",
    label: "Reach-awareness",
    primaryGoal: "Maximize discoverability.",
    audienceOutcome: "Large audience appeal.",
    structure: ["broad hook", "high-interest topic", "quick insight", "share/follow CTA"],
    emphasize: ["anxiety", "ADHD", "trauma", "burnout", "relationships", "trending mental health topics"],
    avoid: ["niche jargon", "lengthy explanations"],
    ctaStyle: ["Follow for more", "Share if this resonates"],
    hookStyle: "Use a broad but emotionally sharp hook that can travel beyond the current audience.",
    emotionalTone: "accessible, quick, high-interest, low-jargon",
    templateDirection: "Use a simple awareness post, Reel cover, Pinterest pin, or quick infographic."
  },
  {
    id: "community-building",
    label: "Community-building",
    primaryGoal: "Create belonging.",
    audienceOutcome: "I am not alone.",
    structure: ["shared experience", "validation", "encouragement", "discussion prompt"],
    emphasize: ["connection", "shared struggles", "collective healing"],
    avoid: ["lectures", "hard sales"],
    ctaStyle: ["You are not alone", "What has helped you?"],
    hookStyle: "Use a shared-experience hook that invites belonging without becoming generic.",
    emotionalTone: "warm, validating, connective, emotionally safe",
    templateDirection: "Use a warm carousel, story prompt, Threads post, or therapist-authored reflection template."
  },
  {
    id: "thought-leadership",
    label: "Thought-leadership",
    primaryGoal: "Position therapist as authority.",
    audienceOutcome: "This therapist has a unique perspective.",
    structure: ["contrarian insight", "clinical explanation", "deeper perspective", "reflection"],
    emphasize: ["therapist expertise", "industry myths", "nuanced takes", "original thinking"],
    avoid: ["surface-level tips", "motivational quotes"],
    ctaStyle: ["What is your take?", "Have you noticed this too?"],
    hookStyle: "Use a nuanced or contrarian perspective hook that challenges a common assumption safely.",
    emotionalTone: "authoritative, nuanced, original, clinically grounded",
    templateDirection: "Use an editorial carousel, LinkedIn-style post, blog/SEO pin, or therapist education template."
  },
  {
    id: "email-list-growth",
    label: "Email-list-growth",
    primaryGoal: "Get email signups.",
    audienceOutcome: "I want the resource.",
    structure: ["problem", "resource", "benefit", "opt-in CTA"],
    emphasize: ["free guides", "quizzes", "checklists", "downloads"],
    avoid: ["unclear resource promises", "hard selling"],
    ctaStyle: ["Grab the free guide", "Download below"],
    hookStyle: "Use a resource-led hook that makes the download feel immediately useful.",
    emotionalTone: "helpful, clear, benefit-led, low-pressure",
    templateDirection: "Use a lead magnet promo, workbook preview, free guide graphic, or Pinterest pin."
  },
  {
    id: "therapy-inquiries",
    label: "Therapy-inquiries",
    primaryGoal: "Convert followers into therapy clients.",
    audienceOutcome: "Therapy might be a safe next step.",
    structure: ["problem", "what therapy helps with", "what working together looks like", "soft invitation"],
    emphasize: ["therapy process", "outcomes", "safety", "expectations"],
    avoid: ["workbook promotion", "vague inspiration"],
    ctaStyle: ["Visit LHtherapy.org", "Learn more about therapy"],
    hookStyle: "Use a service-fit hook that names when therapy support may be helpful without diagnosing.",
    emotionalTone: "safe, reassuring, transparent, conversion-aware",
    templateDirection: "Use a service promo, first-session explainer, therapist education carousel, or consultation CTA layout."
  },
  {
    id: "product-sales",
    label: "Product-sales",
    primaryGoal: "Sell a product.",
    audienceOutcome: "This product could help me with a specific problem.",
    structure: ["pain point", "product solution", "benefits", "transformation", "purchase CTA"],
    emphasize: ["workbook benefits", "specific outcomes", "testimonials", "before/after"],
    avoid: ["overly clinical explanations", "long educational tangents"],
    ctaStyle: ["Get yours today", "Shop now"],
    hookStyle: "Use a problem-to-product hook that connects the product to a specific emotional need or daily use case.",
    emotionalTone: "clear, benefit-focused, supportive, practical",
    templateDirection: "Use a workbook/product promo, Pinterest product pin, carousel, or clean product feature layout."
  }
];

export const CONTENT_GOAL_IDS = CONTENT_GOAL_CONFIGS.map((goal) => goal.id);

export function getContentGoalConfig(goal: string) {
  return CONTENT_GOAL_CONFIGS.find((item) => item.id === goal) || {
    id: goal || "custom",
    label: goal || "Custom",
    primaryGoal: "Create content for the selected goal.",
    audienceOutcome: "The audience understands the intended next step.",
    structure: ["hook", "insight", "takeaway", "CTA"],
    emphasize: ["specificity", "brand voice", "audience relevance"],
    avoid: ["generic filler", "unsupported claims"],
    ctaStyle: ["Use a CTA that directly supports the selected goal."],
    hookStyle: "Use a goal-aligned hook that feels specific, human, and platform-native.",
    emotionalTone: "brand-aligned, clear, emotionally intelligent",
    templateDirection: "Choose the Canva or visual template that best supports the selected goal."
  };
}

export function formatContentGoalForPrompt(goal: string) {
  const config = getContentGoalConfig(goal);
  return `
Content Goal Strategy: ${config.label}
- Primary goal: ${config.primaryGoal}
- Audience outcome: ${config.audienceOutcome}
- Recommended structure: ${config.structure.join(" -> ")}
- Hook style: ${config.hookStyle}
- Emotional tone: ${config.emotionalTone}
- Emphasize: ${config.emphasize.join(", ")}
- Avoid: ${config.avoid.join(", ")}
- CTA style: ${config.ctaStyle.join(" | ")}
- Template selection direction: ${config.templateDirection}
`;
}
