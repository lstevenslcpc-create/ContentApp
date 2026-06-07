export type TopicIntelligenceProfile = {
  topicName: string;
  aliases: string[];
  coreSymptoms: string[];
  hiddenSymptoms: string[];
  emotions: string[];
  thoughtPatterns: string[];
  behaviors: string[];
  realLifeExamples: string[];
  parentMisunderstandings: string[];
  relationshipPatterns: string[];
  commonTriggers: string[];
  therapistInsights: string[];
  evidenceBasedConcepts: string[];
  copingStrategies: string[];
  commonClientQuotes: string[];
  socialMediaAngles: string[];
  recommendedContentTypes: string[];
  recommendedGoals: string[];
  sampleHooks: string[];
  sampleCTAs: string[];
};

const normalizeTopic = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreTopicMatch = (query: string, profile: TopicIntelligenceProfile) => {
  const normalizedQuery = normalizeTopic(query);
  if (!normalizedQuery) return 0;

  const searchableTerms = [profile.topicName, ...profile.aliases].map(normalizeTopic);
  if (searchableTerms.includes(normalizedQuery)) return 100;

  const queryWords = new Set(normalizedQuery.split(" ").filter(Boolean));
  const termWords = new Set(searchableTerms.flatMap((term) => term.split(" ").filter(Boolean)));
  let overlap = 0;
  queryWords.forEach((word) => {
    if (termWords.has(word)) overlap += 1;
  });

  const phraseBonus = searchableTerms.some((term) => term.includes(normalizedQuery) || normalizedQuery.includes(term)) ? 35 : 0;
  return overlap * 12 + phraseBonus;
};

export const TOPIC_INTELLIGENCE_PROFILES: TopicIntelligenceProfile[] = [
  {
    topicName: "Teen Anxiety",
    aliases: ["teen anxiety", "teen mental health", "school anxiety", "anxious teens", "teen stress"],
    coreSymptoms: [
      "stomach aches before school",
      "headaches on high-pressure days",
      "asking to stay home frequently",
      "difficulty sleeping before tests or social events",
      "panic before presentations or tryouts",
      "constant reassurance about grades, friendships, or appearance",
      "perfectionism around grades",
      "avoidance of assignments that feel too hard to start"
    ],
    hiddenSymptoms: [
      "irritability mistaken for attitude",
      "saying I am fine while shutting down",
      "masking all day at school then melting down at home",
      "scrolling to numb after social stress",
      "over-apologizing after small conflict with friends",
      "quietly comparing themselves to classmates",
      "needing exact plans to feel safe",
      "procrastinating because the work feels emotionally loaded"
    ],
    emotions: [
      "embarrassed by needing help",
      "afraid of disappointing parents",
      "lonely even with friends",
      "overwhelmed by expectations",
      "ashamed of not being able to explain what is wrong",
      "angry when adults ask too many questions"
    ],
    thoughtPatterns: [
      "If I mess this up, everyone will know",
      "My friends are mad and I do not know why",
      "I should be able to handle this",
      "If I ask for help, I will look dramatic",
      "One bad grade means I am falling apart",
      "I cannot relax until I know exactly what is happening"
    ],
    behaviors: [
      "avoiding schoolwork until the last minute",
      "checking grades repeatedly",
      "withdrawing after school",
      "snapping at parents during transitions",
      "asking repeated reassurance questions",
      "staying overly busy to avoid feelings",
      "skipping activities they used to enjoy"
    ],
    realLifeExamples: [
      "A teen says she is fine but cannot start the assignment sitting in front of her",
      "A parent sees attitude, but the teen is trying not to cry after holding it together all day",
      "Friendship stress becomes stomach pain before first period",
      "A small grade drop turns into a full night of spiraling",
      "The teen asks to stay home because walking into school feels like walking into judgment"
    ],
    parentMisunderstandings: [
      "assuming irritability is disrespect instead of overload",
      "thinking good grades mean the teen is emotionally fine",
      "believing avoidance is laziness",
      "pushing for immediate conversation when the teen is already flooded",
      "mistaking shutdown for not caring"
    ],
    relationshipPatterns: [
      "hiding stress to avoid worrying parents",
      "needing reassurance after friendship shifts",
      "pulling away when parents get too problem-solving",
      "feeling safer texting feelings than saying them out loud",
      "trying to be the easy kid while feeling overwhelmed inside"
    ],
    commonTriggers: [
      "tests",
      "friend group changes",
      "social media comparison",
      "teacher feedback",
      "parent questions after school",
      "sports or performance pressure",
      "college conversations",
      "unstructured weekends"
    ],
    therapistInsights: [
      "Teen anxiety often communicates through behavior before a teen can explain it in words",
      "Irritability can be the visible edge of fear, shame, or exhaustion",
      "A calm observation usually works better than a rapid series of questions",
      "The goal is not to remove all stress. The goal is to help the teen feel less alone and more capable inside stress",
      "Parents can validate the feeling without removing every challenge"
    ],
    evidenceBasedConcepts: [
      "cognitive distortions",
      "avoidance cycle",
      "somatic anxiety",
      "window of tolerance",
      "emotion coaching",
      "graded exposure",
      "family communication patterns"
    ],
    copingStrategies: [
      "Use one calm observation before asking questions",
      "Break homework into a first two-minute step",
      "Name body cues without panic",
      "Create a post-school decompression routine",
      "Ask whether they want listening, problem-solving, or space",
      "Practice tolerating small uncertainty instead of chasing reassurance"
    ],
    commonClientQuotes: [
      "I do not know why I am so mad",
      "I am fine, can everyone stop asking",
      "If I start it and it is bad, then what",
      "I feel sick every morning but nothing is wrong",
      "I cannot tell if my friends hate me or if I am overthinking"
    ],
    socialMediaAngles: [
      "Signs teen anxiety is hiding behind attitude",
      "What parents miss when their teen says I am fine",
      "School stress that looks like avoidance",
      "Parent scripts for anxious teens",
      "Teen anxiety body symptoms parents should not dismiss"
    ],
    recommendedContentTypes: ["Instagram carousel", "post", "Reel script", "Pinterest infographic", "parent email"],
    recommendedGoals: ["trust-building", "education", "saves", "shares", "therapy-inquiries"],
    sampleHooks: [
      "When your teen says she is fine but cannot start the assignment in front of her",
      "Teen anxiety does not always look like panic. Sometimes it looks like attitude after school",
      "That stomach ache before school might be telling a bigger story",
      "If your teen melts down at home after holding it together all day, read this"
    ],
    sampleCTAs: [
      "Save this if you want a gentler way to understand your teen",
      "Share this with a parent who is trying to decode the attitude",
      "Follow @LHtherapy for therapist-led teen mental health content",
      "If this is affecting daily life, therapy can help your teen build language and coping skills"
    ]
  },
  {
    topicName: "Anxious Attachment",
    aliases: ["anxious attachment", "attachment anxiety", "fear of abandonment", "relationship anxiety"],
    coreSymptoms: [
      "panic after delayed responses",
      "re-reading text messages",
      "needing reassurance to feel calm",
      "feeling a mood shift immediately",
      "fear after emotional distance",
      "difficulty tolerating uncertainty in relationships",
      "checking whether someone is upset"
    ],
    hiddenSymptoms: [
      "editing texts to sound less needy",
      "apologizing for having needs",
      "tracking tone changes in tiny details",
      "feeling embarrassed after asking for reassurance",
      "trying to earn closeness through being easygoing",
      "reading silence as rejection",
      "feeling physically activated before asking a direct question"
    ],
    emotions: [
      "panic",
      "shame",
      "longing",
      "confusion",
      "fear of being too much",
      "relief after reassurance",
      "anger after feeling ignored"
    ],
    thoughtPatterns: [
      "Their tone changed, so I did something wrong",
      "If I ask for reassurance, I will push them away",
      "They are quiet because they are leaving",
      "I need to fix this before I can rest",
      "Maybe I imagined the whole connection",
      "I should not need this much clarity"
    ],
    behaviors: [
      "overexplaining",
      "checking for closeness",
      "protest texting",
      "people pleasing",
      "conflict avoidance",
      "asking the same question in different ways",
      "withdrawing to see if the other person notices"
    ],
    realLifeExamples: [
      "A delayed reply becomes a story about being replaced",
      "A shorter text makes the body start looking for what went wrong",
      "They replay a conversation looking for the moment the mood shifted",
      "They say it is fine while silently waiting for proof they matter",
      "They feel calm only after reassurance, then ashamed for needing it"
    ],
    parentMisunderstandings: [
      "assuming reassurance seeking is attention seeking",
      "calling the reaction dramatic instead of attachment alarm",
      "thinking logic should immediately calm the body",
      "missing how early inconsistency can shape adult relational threat responses"
    ],
    relationshipPatterns: [
      "fawning to keep connection",
      "overfunctioning in relationships",
      "interpreting distance as danger",
      "choosing unavailable partners because familiar tension feels like chemistry",
      "feeling most anxious in relationships that matter most"
    ],
    commonTriggers: [
      "delayed texts",
      "tone shifts",
      "plans changing",
      "emotional distance",
      "conflict",
      "unanswered questions",
      "seeing someone active online but not replying"
    ],
    therapistInsights: [
      "Anxious attachment is often a nervous system alarm, not a character flaw",
      "Reassurance can help briefly, but self-trust and direct communication matter long term",
      "The body may react to ambiguity before the mind can evaluate the facts",
      "Healing includes learning to separate observation from the story the attachment system adds",
      "Needs are not the problem. Panic-driven strategies may be the part that needs support"
    ],
    evidenceBasedConcepts: [
      "attachment theory",
      "protest behavior",
      "nervous system threat response",
      "cognitive fusion",
      "emotion regulation",
      "interpersonal effectiveness",
      "earned secure attachment"
    ],
    copingStrategies: [
      "Name the cue and the story separately",
      "Pause before reassurance-seeking texts",
      "Use direct requests instead of indirect testing",
      "Track body cues before acting from panic",
      "Practice tolerating a small amount of relational uncertainty",
      "Build self-soothing scripts that do not shame the need for connection"
    ],
    commonClientQuotes: [
      "I know it is just a text, but my whole body reacts",
      "I feel needy for wanting clarity",
      "When their tone changes, I cannot think about anything else",
      "I need reassurance, but then I hate myself for needing it",
      "Silence feels like rejection even when I know better"
    ],
    socialMediaAngles: [
      "What anxious attachment feels like in the body",
      "Delayed text spirals explained by a therapist",
      "Tone scanning is not the same as intuition",
      "Observation versus attachment story",
      "How anxious attachment can look high functioning"
    ],
    recommendedContentTypes: ["Instagram carousel", "Reel script", "Threads post", "post", "Pinterest infographic"],
    recommendedGoals: ["follower-growth", "trust-building", "saves", "shares", "therapy-inquiries"],
    sampleHooks: [
      "When their tone changes and your whole body starts looking for what went wrong",
      "A delayed text can feel like danger when your attachment system is already on alert",
      "You are not reading too much into everything. Your body may be scanning for rejection",
      "The hardest part of anxious attachment is knowing the facts and still feeling the panic"
    ],
    sampleCTAs: [
      "Save this if your body reacts before your logic can catch up",
      "Send this to someone who overthinks every tone shift",
      "Follow @LHtherapy for emotionally honest relationship anxiety content",
      "Therapy can help you build steadier communication without shaming your need for connection"
    ]
  },
  {
    topicName: "People Pleasing",
    aliases: ["people pleasing", "fawn response", "approval seeking", "difficulty saying no"],
    coreSymptoms: [
      "saying yes before checking capacity",
      "feeling guilty after setting a boundary",
      "over-apologizing",
      "agreeing to avoid tension",
      "feeling responsible for other people's moods",
      "difficulty naming preferences"
    ],
    hiddenSymptoms: [
      "resentment after being overly accommodating",
      "editing personality to stay liked",
      "feeling anxious when someone is disappointed",
      "confusing peacekeeping with safety",
      "checking facial expressions for approval",
      "feeling selfish for needing rest"
    ],
    emotions: ["guilt", "resentment", "fear", "pressure", "shame", "exhaustion", "relief when others are happy"],
    thoughtPatterns: [
      "If they are upset, it is my fault",
      "I can handle it better than they can",
      "Saying no will make me selfish",
      "I need to explain enough so they are not mad",
      "Their disappointment means I did something wrong"
    ],
    behaviors: [
      "overexplaining boundaries",
      "answering immediately",
      "taking on extra emotional labor",
      "avoiding direct disagreement",
      "checking in excessively",
      "minimizing personal needs"
    ],
    realLifeExamples: [
      "They agree to plans they dread, then feel resentful all week",
      "They write a long explanation for a simple no",
      "They say whatever works for you even when they have a preference",
      "They monitor the room and adjust themselves to keep everyone comfortable"
    ],
    parentMisunderstandings: [
      "praising compliance without noticing anxiety",
      "calling a child easy when they are actually suppressing needs",
      "mistaking quiet accommodation for confidence",
      "missing resentment underneath helpfulness"
    ],
    relationshipPatterns: [
      "attracting people who benefit from overgiving",
      "feeling loved when needed",
      "avoiding conflict until resentment leaks out",
      "becoming the emotional manager in family systems",
      "losing identity inside relationships"
    ],
    commonTriggers: ["disappointment", "conflict", "being misunderstood", "someone's silence", "requests for help", "criticism", "group decisions"],
    therapistInsights: [
      "People pleasing is often a safety strategy, not simply being nice",
      "The work is not becoming less kind. It is becoming more honest",
      "Guilt after a boundary does not mean the boundary was wrong",
      "Resentment can be data about where a yes was not fully honest"
    ],
    evidenceBasedConcepts: ["fawn response", "boundaries", "family roles", "assertiveness", "emotion regulation", "interpersonal schemas"],
    copingStrategies: [
      "Pause before answering requests",
      "Use shorter boundary scripts",
      "Notice guilt without obeying it",
      "Practice naming one small preference",
      "Ask whether the yes is honest or fear-based"
    ],
    commonClientQuotes: [
      "I do not want them to be mad at me",
      "It is easier if I just do it",
      "I feel guilty even when I know I am allowed to say no",
      "I do not know what I want until everyone else decides"
    ],
    socialMediaAngles: [
      "Signs your kindness is actually anxiety",
      "Why boundaries feel rude when people pleasing kept you safe",
      "Short scripts for saying no",
      "People pleasing and resentment",
      "The difference between generosity and self-abandonment"
    ],
    recommendedContentTypes: ["Instagram carousel", "post", "Threads post", "Reel script", "worksheet"],
    recommendedGoals: ["saves", "shares", "follower-growth", "trust-building", "therapy-inquiries"],
    sampleHooks: [
      "If you need everyone to be okay before you can relax, this might be people pleasing",
      "That guilt after saying no does not automatically mean you did something wrong",
      "People pleasing can look like kindness from the outside and panic on the inside"
    ],
    sampleCTAs: [
      "Save this for the next time no feels mean",
      "Send this to someone who apologizes for having needs",
      "Follow @LHtherapy for boundary language that does not shame your softness"
    ]
  },
  {
    topicName: "Perfectionism",
    aliases: ["perfectionism", "perfectionist anxiety", "fear of failure", "high standards"],
    coreSymptoms: [
      "difficulty starting unless conditions feel ideal",
      "rechecking work repeatedly",
      "procrastinating from fear of doing it wrong",
      "feeling crushed by small mistakes",
      "needing external validation before feeling done",
      "overpreparing"
    ],
    hiddenSymptoms: [
      "calling anxiety high standards",
      "resting only after earning it",
      "avoiding hobbies unless good at them",
      "feeling exposed by feedback",
      "struggling to celebrate progress",
      "equating mistakes with identity"
    ],
    emotions: ["pressure", "shame", "fear", "exhaustion", "temporary relief", "envy of relaxed people", "self-criticism"],
    thoughtPatterns: [
      "If it is not excellent, it does not count",
      "I should have known better",
      "People will respect me only if I perform",
      "I cannot stop until it feels perfect",
      "A mistake means I am not who people think I am"
    ],
    behaviors: [
      "overworking",
      "rewriting simple messages",
      "avoiding tasks with uncertain outcomes",
      "asking for reassurance",
      "setting impossible standards",
      "criticizing self before others can"
    ],
    realLifeExamples: [
      "They cannot start the project because the first draft might be messy",
      "One correction in an email ruins the entire day",
      "They stay up late polishing something nobody asked to be perfect",
      "They avoid trying something fun because being a beginner feels humiliating"
    ],
    parentMisunderstandings: [
      "praising achievement without noticing fear",
      "calling the child motivated when they are anxious",
      "assuming good grades mean emotional health",
      "reinforcing outcomes more than process"
    ],
    relationshipPatterns: [
      "hiding mistakes from loved ones",
      "feeling hard to comfort",
      "becoming defensive around feedback",
      "choosing competence over vulnerability",
      "trying to be impressive instead of known"
    ],
    commonTriggers: ["feedback", "new tasks", "public mistakes", "grades", "performance reviews", "comparison", "unstructured creative work"],
    therapistInsights: [
      "Perfectionism often protects against shame more than it creates excellence",
      "Avoidance is common when the standard is impossible",
      "The goal is flexible standards, not lowering all standards",
      "Self-compassion supports accountability better than self-attack"
    ],
    evidenceBasedConcepts: ["cognitive distortions", "all-or-nothing thinking", "exposure to imperfection", "self-compassion", "values-based action"],
    copingStrategies: [
      "Create an intentionally imperfect first draft",
      "Set a good-enough stopping point before starting",
      "Practice receiving feedback without immediate repair",
      "Separate performance from identity",
      "Name what matters besides being impressive"
    ],
    commonClientQuotes: [
      "I know it is not that serious, but it feels like it is",
      "If I cannot do it well, I do not want to do it",
      "I relax only when everything is handled",
      "I am scared people will find out I am not actually good enough"
    ],
    socialMediaAngles: [
      "Perfectionism signs that look productive",
      "Why perfectionists procrastinate",
      "Good enough as nervous system practice",
      "Perfectionism and shame",
      "Scripts for handling feedback"
    ],
    recommendedContentTypes: ["carousel", "post", "Reel script", "Pinterest infographic", "email"],
    recommendedGoals: ["education", "trust-building", "saves", "follower-growth"],
    sampleHooks: [
      "Perfectionism can look like ambition until you notice how afraid you are to start",
      "If the first draft feels emotionally dangerous, this is for you",
      "Sometimes procrastination is perfectionism trying to protect you from shame"
    ],
    sampleCTAs: [
      "Save this for the next time starting feels harder than finishing",
      "Share this with someone who calls anxiety high standards",
      "Follow @LHtherapy for therapist-led content on perfectionism and anxiety"
    ]
  },
  {
    topicName: "Burnout",
    aliases: ["burnout", "emotional exhaustion", "work burnout", "caregiver burnout", "millennial mom burnout"],
    coreSymptoms: [
      "waking up already tired",
      "feeling numb toward tasks that used to matter",
      "resentment about ordinary requests",
      "brain fog",
      "low patience",
      "difficulty recovering after rest",
      "dreading notifications"
    ],
    hiddenSymptoms: [
      "fantasizing about disappearing for a day",
      "crying over small inconveniences",
      "feeling overstimulated by being needed",
      "losing creativity",
      "avoiding texts because every reply feels like a task",
      "feeling guilty for needing quiet"
    ],
    emotions: ["resentment", "numbness", "guilt", "grief", "irritability", "helplessness", "loneliness"],
    thoughtPatterns: [
      "I cannot drop anything because everyone needs me",
      "Rest will only make me fall further behind",
      "I should be grateful, so why am I so angry",
      "If I stop, everything will collapse",
      "I do not have anything left to give"
    ],
    behaviors: [
      "doom scrolling for relief",
      "withdrawing from friends",
      "overreacting to small requests",
      "working through exhaustion",
      "forgetting basic needs",
      "becoming task-focused and emotionally unavailable"
    ],
    realLifeExamples: [
      "A simple question feels like one more demand on an already full system",
      "They sit in the car after errands because walking inside means being needed again",
      "They avoid opening email because every message feels like a problem",
      "They feel guilty for wanting silence from people they love"
    ],
    parentMisunderstandings: [
      "assuming burnout is laziness",
      "telling someone to just take a break without reducing demands",
      "missing how invisible labor drains the nervous system",
      "thinking irritability means lack of love"
    ],
    relationshipPatterns: [
      "withdrawing to protect the last bit of energy",
      "resenting people who depend on them",
      "difficulty asking for help until crisis",
      "feeling unseen by partners or family",
      "overfunctioning then crashing"
    ],
    commonTriggers: ["constant notifications", "caregiving demands", "work deadlines", "lack of recovery time", "emotional labor", "financial stress", "seasonal pressure"],
    therapistInsights: [
      "Burnout is not solved by one bubble bath when the demand pattern stays the same",
      "Resentment often points to chronic overextension",
      "Recovery requires reducing load, increasing support, and rebuilding agency",
      "Numbness can be a nervous system conservation response"
    ],
    evidenceBasedConcepts: ["chronic stress", "allostatic load", "boundary setting", "behavioral activation", "nervous system recovery", "values clarification"],
    copingStrategies: [
      "Identify what can be paused, delegated, delayed, or done at a lower standard",
      "Build transition rituals after work or caregiving",
      "Schedule real recovery before the crash",
      "Name invisible labor out loud",
      "Use body-based downshifting before problem-solving"
    ],
    commonClientQuotes: [
      "I do not even know what I need anymore",
      "I love my people, but I am tired of being needed",
      "Rest does not feel restful",
      "I feel like a bad person because I am so irritated"
    ],
    socialMediaAngles: [
      "Burnout signs that do not look like burnout",
      "When being needed feels overstimulating",
      "Invisible labor and resentment",
      "Why rest is not working",
      "Burnout recovery beyond self-care"
    ],
    recommendedContentTypes: ["carousel", "post", "Pinterest infographic", "newsletter", "Reel script"],
    recommendedGoals: ["trust-building", "saves", "shares", "therapy-inquiries"],
    sampleHooks: [
      "When every small request feels like too much, your body may not be dramatic. It may be depleted",
      "Burnout can sound like I just need everyone to stop needing me for one hour",
      "If rest does not feel restful anymore, look at the load you are returning to"
    ],
    sampleCTAs: [
      "Save this for when you need language for burnout",
      "Send this to someone carrying invisible labor",
      "Follow @LHtherapy for therapist-led burnout and nervous system content"
    ]
  },
  {
    topicName: "High Functioning Anxiety",
    aliases: ["high functioning anxiety", "hidden anxiety", "productive anxiety", "anxious high achievers"],
    coreSymptoms: [
      "overpreparing",
      "constant mental rehearsal",
      "difficulty resting",
      "reassurance seeking hidden as checking",
      "feeling tense even when things are going well",
      "overthinking ordinary decisions"
    ],
    hiddenSymptoms: [
      "being praised for the coping strategy that is exhausting them",
      "using achievement to manage fear",
      "appearing calm while internally scanning for mistakes",
      "feeling guilty during downtime",
      "needing control to feel safe",
      "calling anxiety discipline"
    ],
    emotions: ["pressure", "fear", "restlessness", "shame", "pride mixed with exhaustion", "loneliness"],
    thoughtPatterns: [
      "If I stop, I will fall behind",
      "People only see me as capable",
      "I have to be prepared for every outcome",
      "I should not be anxious because I am doing well",
      "My worth depends on staying impressive"
    ],
    behaviors: [
      "checking calendars repeatedly",
      "overcommitting",
      "answering messages quickly",
      "staying busy to avoid feelings",
      "planning for worst-case scenarios",
      "struggling to ask for support"
    ],
    realLifeExamples: [
      "They look organized but feel one mistake away from being exposed",
      "They cannot enjoy success because the next task is already loud",
      "They say yes because being reliable feels safer than disappointing someone",
      "They turn every break into a productivity window"
    ],
    parentMisunderstandings: [
      "assuming achievement means the person is fine",
      "praising overwork without noticing fear",
      "calling anxiety responsibility",
      "missing the cost of being the capable one"
    ],
    relationshipPatterns: [
      "becoming the dependable one",
      "struggling to receive care",
      "feeling unseen because competence hides distress",
      "resenting others while refusing help",
      "performing okayness"
    ],
    commonTriggers: ["uncertainty", "mistakes", "unstructured time", "feedback", "rest", "being perceived", "letting someone down"],
    therapistInsights: [
      "High functioning anxiety often gets rewarded, which makes it harder to recognize",
      "Capability does not cancel distress",
      "The treatment target is not ambition. It is fear-based overfunctioning",
      "Rest can feel unsafe when productivity has become emotional protection"
    ],
    evidenceBasedConcepts: ["overfunctioning", "cognitive distortions", "intolerance of uncertainty", "somatic anxiety", "self-worth schemas"],
    copingStrategies: [
      "Practice good-enough completion",
      "Schedule nonproductive recovery",
      "Separate preparation from reassurance seeking",
      "Track what anxiety costs, not only what it helps you achieve",
      "Use uncertainty tolerance exercises"
    ],
    commonClientQuotes: [
      "Everyone thinks I am fine because I get things done",
      "I do not know how to rest without feeling guilty",
      "I am exhausted from being reliable",
      "I wish someone could see how hard I am trying"
    ],
    socialMediaAngles: [
      "What high-functioning anxiety looks like when nobody can tell",
      "When productivity is actually fear management",
      "Signs the capable one is anxious",
      "Why rest feels unsafe",
      "High achiever anxiety and hidden exhaustion"
    ],
    recommendedContentTypes: ["carousel", "post", "Threads post", "Reel script", "blog outline"],
    recommendedGoals: ["follower-growth", "trust-building", "shares", "therapy-inquiries"],
    sampleHooks: [
      "High-functioning anxiety is being praised for the same habits that are exhausting you",
      "When everyone calls you capable but your body feels like one mistake from collapse",
      "If rest feels irresponsible, your anxiety may be wearing productivity as a disguise"
    ],
    sampleCTAs: [
      "Save this if being capable has felt lonely lately",
      "Send this to the reliable friend who never asks for help",
      "Follow @LHtherapy for emotionally honest anxiety content"
    ]
  },
  {
    topicName: "ADHD in Women",
    aliases: ["adhd in women", "women with adhd", "adhd girls", "late diagnosed adhd", "adhd masking"],
    coreSymptoms: [
      "time blindness",
      "difficulty starting tasks",
      "forgetting appointments despite caring",
      "emotional overwhelm",
      "messy systems hidden behind intense effort",
      "difficulty switching tasks",
      "rejection sensitivity"
    ],
    hiddenSymptoms: [
      "masking disorganization with overpreparation",
      "feeling lazy despite working twice as hard",
      "burnout from compensating",
      "shame after missed details",
      "needing urgency to begin",
      "appearing put together while privately overwhelmed"
    ],
    emotions: ["shame", "frustration", "relief after diagnosis", "grief", "overstimulation", "hope", "self-doubt"],
    thoughtPatterns: [
      "Why can everyone else just do the thing",
      "I care, so why do I keep forgetting",
      "If I tell people, they will think I am making excuses",
      "I need pressure before my brain turns on",
      "Maybe I am just lazy"
    ],
    behaviors: [
      "creating elaborate systems then abandoning them",
      "doom piles",
      "last-minute productivity bursts",
      "overcommitting during high-energy moments",
      "avoiding boring admin tasks",
      "interrupting or overexplaining from excitement"
    ],
    realLifeExamples: [
      "She buys the planner, fills it out beautifully, then forgets it exists",
      "She is late because leaving requires ten invisible steps",
      "She remembers everyone else's needs but misses her own appointment",
      "She works all night because urgency finally made the task possible"
    ],
    parentMisunderstandings: [
      "mistaking ADHD symptoms for carelessness",
      "calling girls dramatic when emotional dysregulation is present",
      "missing ADHD because grades are good",
      "assuming organization problems mean lack of discipline"
    ],
    relationshipPatterns: [
      "feeling criticized for forgotten tasks",
      "over-apologizing for symptoms",
      "needing partners to understand executive function",
      "shame spirals after small mistakes",
      "conflict around household labor"
    ],
    commonTriggers: ["boring tasks", "transitions", "time pressure", "criticism", "clutter", "multi-step errands", "unclear expectations"],
    therapistInsights: [
      "ADHD in women is often hidden by masking, shame, and compensatory perfectionism",
      "Executive dysfunction is not a moral failure",
      "Support works better when it reduces friction instead of demanding more willpower",
      "Late diagnosis can bring grief and relief at the same time"
    ],
    evidenceBasedConcepts: ["executive function", "dopamine regulation", "emotional dysregulation", "rejection sensitivity", "masking", "body doubling"],
    copingStrategies: [
      "Externalize reminders",
      "Use body doubling",
      "Reduce task steps",
      "Build transition buffers",
      "Create visible systems",
      "Design for interest, urgency, novelty, or accountability"
    ],
    commonClientQuotes: [
      "I swear I care, but I still forgot",
      "I feel like I am always almost caught up",
      "I can do hard things, but not simple boring things",
      "I thought I was lazy until I understood my brain"
    ],
    socialMediaAngles: [
      "ADHD in women signs that get missed",
      "Why planners do not always fix ADHD",
      "Executive dysfunction is not laziness",
      "Late diagnosis grief",
      "ADHD masking and burnout"
    ],
    recommendedContentTypes: ["carousel", "Reel script", "post", "Pinterest infographic", "blog outline"],
    recommendedGoals: ["education", "follower-growth", "saves", "shares"],
    sampleHooks: [
      "ADHD in women can look like being put together in public and overwhelmed in private",
      "If you care deeply and still forget the thing, this is not a character flaw",
      "Buying the planner was not the problem. Expecting it to replace executive function was"
    ],
    sampleCTAs: [
      "Save this if you need language for executive dysfunction",
      "Share this with someone who still thinks ADHD is just being distracted",
      "Follow @LHtherapy for shame-free mental health education"
    ]
  },
  {
    topicName: "Trauma Responses",
    aliases: ["trauma responses", "fight flight freeze fawn", "trauma triggers", "survival responses"],
    coreSymptoms: [
      "fight response during perceived threat",
      "flight through busyness or escape",
      "freeze when overwhelmed",
      "fawn through appeasing others",
      "body alarm during safe situations",
      "difficulty feeling present"
    ],
    hiddenSymptoms: [
      "laughing during discomfort",
      "going blank in conflict",
      "becoming overly agreeable",
      "needing control to feel safe",
      "feeling numb after stress",
      "overexplaining to prevent anger"
    ],
    emotions: ["fear", "numbness", "anger", "shame", "confusion", "hypervigilance", "relief after escape"],
    thoughtPatterns: [
      "I need to get out of here",
      "If I keep them calm, I will be safe",
      "I cannot think right now",
      "Something bad is about to happen",
      "My reaction is too much, but I cannot stop it"
    ],
    behaviors: [
      "people pleasing under pressure",
      "shutting down in conflict",
      "snapping when feeling cornered",
      "staying busy to avoid memories",
      "scanning exits or moods",
      "avoiding reminders"
    ],
    realLifeExamples: [
      "A calm disagreement makes the body react like danger is present",
      "They agree quickly because disagreement once felt unsafe",
      "They cannot find words during conflict and later know exactly what they wanted to say",
      "They feel exhausted after a social event because their body was scanning the whole time"
    ],
    parentMisunderstandings: [
      "calling shutdown disrespect",
      "assuming fawning is politeness",
      "punishing survival behavior without understanding threat response",
      "expecting logic to override body alarm quickly"
    ],
    relationshipPatterns: [
      "conflict avoidance",
      "appeasing volatile people",
      "difficulty trusting calm",
      "pulling away after closeness",
      "mistaking intensity for safety"
    ],
    commonTriggers: ["tone shifts", "criticism", "raised voices", "being trapped", "uncertainty", "touch without consent", "feeling watched"],
    therapistInsights: [
      "A trauma response is the nervous system trying to protect, not the person trying to be difficult",
      "The body can respond to reminders, not just current danger",
      "Healing often includes building present-moment safety before processing the story",
      "Understanding the response reduces shame and creates choice"
    ],
    evidenceBasedConcepts: ["fight flight freeze fawn", "polyvagal-informed regulation", "window of tolerance", "trauma triggers", "somatic awareness", "grounding"],
    copingStrategies: [
      "Orient to the room",
      "Name current safety cues",
      "Use grounding before explaining",
      "Track triggers without judging them",
      "Practice consent-based boundaries",
      "Build regulation before hard conversations"
    ],
    commonClientQuotes: [
      "I know I am safe, but my body does not",
      "I freeze and then hate myself later",
      "I become agreeable when I am scared",
      "I cannot tell if it is intuition or trauma"
    ],
    socialMediaAngles: [
      "Trauma responses that look like personality traits",
      "Freeze response in conflict",
      "Fawning is not the same as kindness",
      "When your body reacts before your mind catches up",
      "Current safety versus old alarm"
    ],
    recommendedContentTypes: ["carousel", "post", "Reel script", "Pinterest infographic", "safety disclaimer post"],
    recommendedGoals: ["education", "trust-building", "saves", "shares"],
    sampleHooks: [
      "Sometimes your body reacts to the reminder, not the room you are in now",
      "Fawning can look like being easygoing, but inside it may feel like survival",
      "Freezing in conflict is not weakness. It is a nervous system response"
    ],
    sampleCTAs: [
      "Save this if it gave language to a reaction you have judged",
      "Share this with someone learning their nervous system responses",
      "Educational only. If trauma symptoms are affecting daily life, support can help"
    ]
  },
  {
    topicName: "Low Self Esteem",
    aliases: ["low self esteem", "self worth", "low confidence", "negative self image"],
    coreSymptoms: [
      "difficulty accepting compliments",
      "constant comparison",
      "assuming others are judging",
      "minimizing accomplishments",
      "fear of taking up space",
      "apologizing for needs"
    ],
    hiddenSymptoms: [
      "overachieving to feel worthy",
      "choosing familiar criticism",
      "staying quiet to avoid being wrong",
      "settling in relationships",
      "calling self-protection being realistic",
      "needing permission to want more"
    ],
    emotions: ["shame", "sadness", "envy", "fear", "embarrassment", "hopelessness", "longing"],
    thoughtPatterns: [
      "They are just being nice",
      "I am too much and not enough at the same time",
      "If people really knew me, they would leave",
      "I should be further along",
      "Other people deserve that more than I do"
    ],
    behaviors: [
      "deflecting praise",
      "overexplaining mistakes",
      "avoiding photos",
      "not applying for opportunities",
      "staying in one-sided relationships",
      "self-sabotaging when things go well"
    ],
    realLifeExamples: [
      "They receive a compliment and immediately explain why it does not count",
      "They stay in a friendship where they feel small because it feels familiar",
      "They avoid applying because rejection would confirm the story they already fear",
      "They apologize before asking a reasonable question"
    ],
    parentMisunderstandings: [
      "assuming praise alone fixes self-esteem",
      "missing the impact of repeated criticism",
      "calling a child shy when shame is present",
      "focusing only on confidence instead of belonging and safety"
    ],
    relationshipPatterns: [
      "accepting less than they need",
      "testing whether people will leave",
      "overgiving to feel chosen",
      "difficulty trusting affection",
      "staying small to avoid criticism"
    ],
    commonTriggers: ["compliments", "comparison", "rejection", "photos", "feedback", "new opportunities", "being noticed"],
    therapistInsights: [
      "Low self-esteem is often a learned relationship with the self, not a permanent truth",
      "Confidence usually follows repeated experiences of safety, competence, and self-respect",
      "The goal is not constant positivity. It is a more accurate and compassionate self-view",
      "Receiving care can feel unfamiliar when criticism has been the norm"
    ],
    evidenceBasedConcepts: ["core beliefs", "self-compassion", "cognitive restructuring", "attachment schemas", "behavioral experiments"],
    copingStrategies: [
      "Practice not arguing with compliments",
      "Track evidence against the harsh self-story",
      "Take one small action before confidence arrives",
      "Notice relationships that shrink or expand you",
      "Use neutral self-talk before positive affirmations"
    ],
    commonClientQuotes: [
      "I do not believe people when they say nice things",
      "I feel like everyone else got a manual I missed",
      "I am scared to want more because what if I cannot have it",
      "I know it sounds harsh, but it feels true"
    ],
    socialMediaAngles: [
      "Low self-esteem signs that look like humility",
      "Why compliments feel uncomfortable",
      "Neutral self-talk for low self-worth",
      "When familiar criticism feels safer than kindness",
      "Self-esteem and relationships"
    ],
    recommendedContentTypes: ["post", "carousel", "Reel script", "journal prompt", "Pinterest pin"],
    recommendedGoals: ["trust-building", "saves", "shares", "therapy-inquiries"],
    sampleHooks: [
      "Low self-esteem can sound like arguing with every compliment before it has a chance to land",
      "Sometimes staying small feels safer than finding out what you actually want",
      "You may not need louder confidence. You may need a less cruel inner narrator"
    ],
    sampleCTAs: [
      "Save this for a day your self-talk gets loud",
      "Share this with someone who deflects every compliment",
      "Follow @LHtherapy for grounded self-worth content"
    ]
  },
  {
    topicName: "Emotional Avoidance",
    aliases: ["emotional avoidance", "avoiding feelings", "emotional shutdown", "numbing emotions"],
    coreSymptoms: [
      "staying busy to avoid feelings",
      "changing the subject when emotions come up",
      "numbing with scrolling, food, work, or sleep",
      "difficulty identifying feelings",
      "intellectualizing pain",
      "feeling disconnected from the body"
    ],
    hiddenSymptoms: [
      "being the advice giver to avoid vulnerability",
      "joking when conversations get real",
      "calling sadness being dramatic",
      "needing crisis before allowing emotion",
      "feeling irritated when someone asks how you are",
      "solving instead of feeling"
    ],
    emotions: ["numbness", "fear", "irritation", "sadness", "grief", "shame", "unease"],
    thoughtPatterns: [
      "If I feel it, I will fall apart",
      "There is no point talking about it",
      "Other people have it worse",
      "I just need to move on",
      "Feelings make things messy"
    ],
    behaviors: [
      "overworking",
      "doom scrolling",
      "minimizing pain",
      "giving advice instead of sharing",
      "avoiding quiet",
      "canceling therapy or deep conversations when close to something real"
    ],
    realLifeExamples: [
      "They clean the whole house instead of letting themselves cry",
      "They can explain the problem perfectly but cannot feel the grief underneath",
      "They say it is fine, then feel disconnected for days",
      "They open their phone the second silence makes emotion noticeable"
    ],
    parentMisunderstandings: [
      "praising toughness while missing emotional disconnection",
      "assuming a quiet child is fine",
      "teaching problem-solving before emotional naming",
      "minimizing feelings because the behavior looks controlled"
    ],
    relationshipPatterns: [
      "partners feel shut out",
      "conflict gets postponed until resentment builds",
      "vulnerability feels unsafe",
      "care is offered through tasks instead of emotional presence",
      "closeness triggers withdrawal"
    ],
    commonTriggers: ["quiet", "grief", "conflict", "being asked how you feel", "therapy homework", "unstructured time", "someone else's big emotions"],
    therapistInsights: [
      "Avoiding emotion can work short term while making feelings louder long term",
      "Intellectualizing is often a sophisticated form of distance from pain",
      "The first goal is tolerating small doses of emotion, not forcing a breakthrough",
      "Emotions are information and body states, not emergencies by default"
    ],
    evidenceBasedConcepts: ["experiential avoidance", "emotion regulation", "distress tolerance", "somatic awareness", "acceptance and commitment therapy"],
    copingStrategies: [
      "Name one body sensation before naming the emotion",
      "Set a two-minute timer for feeling without fixing",
      "Use a feelings wheel",
      "Practice saying one honest sentence",
      "Notice the urge to numb without immediately obeying it"
    ],
    commonClientQuotes: [
      "I can talk about it like a case study, but I cannot feel it",
      "If I stop moving, I think I will fall apart",
      "I do not know what I feel. I just feel off",
      "I hate when people ask what is wrong"
    ],
    socialMediaAngles: [
      "Emotional avoidance signs that look productive",
      "Intellectualizing instead of feeling",
      "When numbing becomes the coping skill",
      "Two-minute emotion tolerance",
      "Why feelings get louder when ignored"
    ],
    recommendedContentTypes: ["post", "carousel", "Reel script", "journal prompt", "email"],
    recommendedGoals: ["education", "trust-building", "saves", "therapy-inquiries"],
    sampleHooks: [
      "Emotional avoidance can look like being productive every time your body wants to cry",
      "If you can explain your pain perfectly but cannot feel it, this may be the pattern",
      "Sometimes I am fine means I cannot safely touch that feeling yet"
    ],
    sampleCTAs: [
      "Save this for the next time you start solving instead of feeling",
      "Share this with someone who gets busy when emotions get close",
      "Follow @LHtherapy for therapist-led emotional awareness content"
    ]
  }
];

export function findClosestTopic(topic: string) {
  const ranked = TOPIC_INTELLIGENCE_PROFILES
    .map((profile) => ({ profile, score: scoreTopicMatch(topic, profile) }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score > 0 ? ranked[0].profile : null;
}

export function getTopicIntelligence(topic: string) {
  return findClosestTopic(topic);
}

export function getTopicAngles(topic: string) {
  const profile = getTopicIntelligence(topic);
  if (!profile) {
    return {
      topicName: topic,
      socialMediaAngles: [],
      sampleHooks: [],
      sampleCTAs: [],
      recommendedContentTypes: [],
      recommendedGoals: []
    };
  }

  return {
    topicName: profile.topicName,
    socialMediaAngles: profile.socialMediaAngles,
    sampleHooks: profile.sampleHooks,
    sampleCTAs: profile.sampleCTAs,
    recommendedContentTypes: profile.recommendedContentTypes,
    recommendedGoals: profile.recommendedGoals
  };
}
