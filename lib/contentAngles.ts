import { getContentGoalConfig } from "./contentGoalConfig";
import { findClosestTopic } from "./topicIntelligence";

export type ContentAngle = {
  name: string;
  description: string;
  bestGoals: string[];
  hookDirection: string;
};

export type TopicContentAngles = {
  topicName: string;
  angles: ContentAngle[];
};

const defaultAngles: ContentAngle[] = [
  {
    name: "Hidden Signs",
    description: "Name subtle signs people often miss or mislabel.",
    bestGoals: ["awareness", "follower-growth", "trust-building"],
    hookDirection: "Start with a recognizable hidden symptom."
  },
  {
    name: "What Helps",
    description: "Give practical, grounded next steps without overpromising.",
    bestGoals: ["education", "saves", "therapy-inquiries"],
    hookDirection: "Start with one small supportive shift."
  },
  {
    name: "Therapist Perspective",
    description: "Explain what a therapist sees underneath the behavior.",
    bestGoals: ["trust-building", "thought-leadership", "education"],
    hookDirection: "Start with what people misunderstand about the behavior."
  },
  {
    name: "Common Misconceptions",
    description: "Correct a common myth in a compassionate way.",
    bestGoals: ["education", "trust-building", "shares"],
    hookDirection: "Start with the misconception and reframe it."
  }
];

export const TOPIC_CONTENT_ANGLES: TopicContentAngles[] = [
  {
    topicName: "Teen Anxiety",
    angles: [
      { name: "Hidden Signs", description: "Anxiety signs that look quiet, indirect, or easy to miss.", bestGoals: ["awareness", "follower-growth", "trust-building"], hookDirection: "Name one hidden teen anxiety behavior before explaining it." },
      { name: "School Anxiety", description: "Anxiety around school mornings, assignments, teachers, tests, and attendance.", bestGoals: ["education", "saves", "therapy-inquiries"], hookDirection: "Start with a school-specific moment like stomach aches or refusing an assignment." },
      { name: "Social Anxiety", description: "Friendship stress, lunchroom anxiety, group chats, being perceived, and social comparison.", bestGoals: ["follower-growth", "shares", "trust-building"], hookDirection: "Start with a friend or peer moment that creates body panic." },
      { name: "Sports Anxiety", description: "Performance pressure, tryouts, coach feedback, team dynamics, and fear of mistakes.", bestGoals: ["awareness", "education", "therapy-inquiries"], hookDirection: "Open with a physical or performance cue before a game or tryout." },
      { name: "Perfectionism", description: "Grade pressure, fear of mistakes, overchecking, and self-worth tied to achievement.", bestGoals: ["trust-building", "education", "saves"], hookDirection: "Start with a grade, assignment, or first-draft anxiety moment." },
      { name: "Irritability", description: "How anxiety can look like attitude, snapping, or anger after holding it together.", bestGoals: ["trust-building", "shares", "education"], hookDirection: "Open with the attitude parents see and the anxiety underneath it." },
      { name: "Avoidance", description: "Avoiding assignments, school, texts, activities, or conversations to reduce anxiety.", bestGoals: ["education", "saves", "therapy-inquiries"], hookDirection: "Show how avoidance feels helpful now and costly later." },
      { name: "Stomach Aches", description: "Body-based anxiety symptoms before school, social situations, or performance.", bestGoals: ["awareness", "trust-building", "shares"], hookDirection: "Start with the body symptom adults may dismiss." },
      { name: "Sleep Issues", description: "Racing thoughts, bedtime reassurance, late scrolling, and next-day dread.", bestGoals: ["education", "saves", "therapy-inquiries"], hookDirection: "Start with bedtime anxiety or the night-before spiral." },
      { name: "Parent Mistakes", description: "Common parent responses that accidentally increase pressure or shutdown.", bestGoals: ["saves", "shares", "trust-building"], hookDirection: "Start with a loving response that can still miss the teen's nervous system state." },
      { name: "What Helps", description: "Concrete parent scripts, decompression routines, and tolerable next steps.", bestGoals: ["saves", "education", "therapy-inquiries"], hookDirection: "Lead with a practical script or small supportive shift." },
      { name: "What Makes It Worse", description: "Pressure, interrogation, minimizing, forced positivity, and all-or-nothing expectations.", bestGoals: ["shares", "education", "trust-building"], hookDirection: "Name the well-intended move that can make anxiety louder." },
      { name: "Therapist Perspective", description: "What therapists notice beneath shutdown, avoidance, irritability, and perfectionism.", bestGoals: ["trust-building", "thought-leadership", "education"], hookDirection: "Start with what the behavior may be communicating." },
      { name: "Anxiety vs Laziness", description: "Differentiate avoidance from lack of caring.", bestGoals: ["education", "trust-building", "shares"], hookDirection: "Open with the assignment they cannot start even though they care." },
      { name: "Anxiety vs ADHD", description: "Compare anxiety-driven avoidance with executive function challenges.", bestGoals: ["education", "thought-leadership", "saves"], hookDirection: "Start with the same visible behavior and two different possible roots." },
      { name: "Anxiety vs Defiance", description: "Explain how anxious shutdown can be misread as disrespect.", bestGoals: ["trust-building", "shares", "therapy-inquiries"], hookDirection: "Start with the behavior adults call defiance and reframe it clinically." },
      { name: "Friendship Stress", description: "Friend group shifts, vague texts, exclusion fears, and social media comparison.", bestGoals: ["follower-growth", "shares", "trust-building"], hookDirection: "Open with a friendship cue that changes the teen's whole day." },
      { name: "Masking All Day", description: "Holding it together at school and falling apart at home.", bestGoals: ["trust-building", "shares", "awareness"], hookDirection: "Start with after-school collapse after a high-functioning day." }
    ]
  },
  {
    topicName: "Anxious Attachment",
    angles: [
      { name: "Texting", description: "Delayed replies, short messages, timestamps, and rereading texts.", bestGoals: ["follower-growth", "shares", "trust-building"], hookDirection: "Start with a delayed or shorter text and the body reaction it creates." },
      { name: "Overthinking", description: "Mental spirals, replaying conversations, and searching for hidden meaning.", bestGoals: ["follower-growth", "saves", "education"], hookDirection: "Open with the moment logic knows one thing and the body believes another." },
      { name: "Reassurance Seeking", description: "Needing clarity, asking again, and feeling ashamed afterward.", bestGoals: ["education", "saves", "therapy-inquiries"], hookDirection: "Start with reassurance helping briefly but not lasting." },
      { name: "Conflict", description: "Fear during disagreement, overexplaining, fawning, or panic repair.", bestGoals: ["trust-building", "saves", "therapy-inquiries"], hookDirection: "Start with a disagreement feeling like disconnection." },
      { name: "Mood Changes", description: "Reading subtle shifts in tone, warmth, facial expression, and energy.", bestGoals: ["follower-growth", "trust-building", "shares"], hookDirection: "Start with the exact tone shift or energy change." },
      { name: "Fear of Rejection", description: "Interpreting silence, distance, or ambiguity as being unwanted.", bestGoals: ["trust-building", "education", "shares"], hookDirection: "Open with the story rejection fear tells from limited evidence." },
      { name: "Body Panic", description: "Attachment anxiety as tight chest, stomach drop, restlessness, and urgency.", bestGoals: ["awareness", "education", "saves"], hookDirection: "Lead with what the body does before the mind can reason." },
      { name: "Protest Behavior", description: "Testing, withdrawing, escalating, or indirect bids for closeness.", bestGoals: ["education", "trust-building", "therapy-inquiries"], hookDirection: "Start with a behavior that is secretly asking if the connection is safe." },
      { name: "Observation vs Story", description: "Separating what happened from what the attachment alarm added.", bestGoals: ["saves", "education", "trust-building"], hookDirection: "Open with one cue and two interpretations." },
      { name: "Secure Communication", description: "Direct requests, repair language, boundaries, and tolerating uncertainty.", bestGoals: ["saves", "therapy-inquiries", "education"], hookDirection: "Start with what to say instead of testing or overexplaining." },
      { name: "Dating Patterns", description: "Unavailable partners, inconsistency, chemistry, and nervous system familiarity.", bestGoals: ["follower-growth", "trust-building", "therapy-inquiries"], hookDirection: "Open with mistaking inconsistency for chemistry." },
      { name: "Shame After Needs", description: "Feeling too much after asking for clarity, care, or reassurance.", bestGoals: ["shares", "trust-building", "therapy-inquiries"], hookDirection: "Start with the shame after a reasonable need." }
    ]
  },
  {
    topicName: "People Pleasing",
    angles: [
      { name: "Boundary Guilt", description: "Feeling wrong after a reasonable no.", bestGoals: ["saves", "shares", "therapy-inquiries"], hookDirection: "Start with guilt after a boundary." },
      { name: "Fawn Response", description: "Appeasing others as a safety strategy.", bestGoals: ["education", "trust-building", "shares"], hookDirection: "Show kindness on the outside and fear on the inside." },
      { name: "Resentment", description: "Resentment as data about dishonest yeses.", bestGoals: ["trust-building", "education", "saves"], hookDirection: "Open with a yes that turns into resentment." },
      { name: "Overexplaining", description: "Long explanations for simple needs, limits, or preferences.", bestGoals: ["follower-growth", "saves", "shares"], hookDirection: "Start with the paragraph-length no." },
      { name: "Family Roles", description: "Being the easy one, helper, peacekeeper, or emotional manager.", bestGoals: ["trust-building", "therapy-inquiries", "shares"], hookDirection: "Name the role that got praised but became a trap." },
      { name: "Workplace People Pleasing", description: "Taking on too much to avoid disappointment.", bestGoals: ["education", "saves", "product-sales"], hookDirection: "Open with saying yes before checking capacity." },
      { name: "What Helps", description: "Short scripts, pause skills, and honest yes/no decisions.", bestGoals: ["saves", "education", "email-list-growth"], hookDirection: "Lead with a simple boundary script." },
      { name: "Kindness vs Self-Abandonment", description: "Separate genuine care from fear-based compliance.", bestGoals: ["thought-leadership", "trust-building", "shares"], hookDirection: "Start with the difference between caring and disappearing." }
    ]
  },
  {
    topicName: "Perfectionism",
    angles: [
      { name: "Procrastination", description: "Avoiding a task because imperfect effort feels exposing.", bestGoals: ["education", "follower-growth", "saves"], hookDirection: "Start with the first draft that feels dangerous." },
      { name: "Fear of Failure", description: "Mistakes as identity threat, not just inconvenience.", bestGoals: ["trust-building", "therapy-inquiries", "shares"], hookDirection: "Open with one small mistake becoming a whole self-story." },
      { name: "Good Enough", description: "Flexible standards and tolerating imperfect completion.", bestGoals: ["saves", "education", "product-sales"], hookDirection: "Lead with a good-enough action as practice." },
      { name: "High Standards vs Anxiety", description: "Differentiate values-driven excellence from fear-driven overcontrol.", bestGoals: ["thought-leadership", "education", "trust-building"], hookDirection: "Start with the cost of calling anxiety high standards." },
      { name: "Feedback Shame", description: "Feeling exposed, defensive, or crushed by correction.", bestGoals: ["trust-building", "saves", "therapy-inquiries"], hookDirection: "Open with one note of feedback ruining the whole day." },
      { name: "Rest and Worth", description: "Rest feeling unearned when worth is tied to output.", bestGoals: ["follower-growth", "shares", "trust-building"], hookDirection: "Start with guilt during rest." }
    ]
  },
  {
    topicName: "Burnout",
    angles: [
      { name: "Hidden Burnout Signs", description: "Numbness, irritability, dread, and reduced capacity.", bestGoals: ["awareness", "follower-growth", "trust-building"], hookDirection: "Name one ordinary request that suddenly feels impossible." },
      { name: "Invisible Labor", description: "Mental load, caregiving, planning, and emotional management.", bestGoals: ["shares", "trust-building", "therapy-inquiries"], hookDirection: "Open with carrying things nobody sees." },
      { name: "Rest Not Working", description: "Why rest fails when the demand pattern remains unchanged.", bestGoals: ["education", "thought-leadership", "saves"], hookDirection: "Start with rest that does not feel restful." },
      { name: "Mom Burnout", description: "Overstimulation, guilt, being needed, and lack of recovery.", bestGoals: ["shares", "therapy-inquiries", "trust-building"], hookDirection: "Open with wanting quiet from people you love." },
      { name: "Work Burnout", description: "Notifications, meetings, deadlines, and emotional depletion.", bestGoals: ["education", "saves", "therapy-inquiries"], hookDirection: "Start with the body sinking when email opens." },
      { name: "What Helps", description: "Load reduction, boundaries, support, and real recovery.", bestGoals: ["saves", "education", "therapy-inquiries"], hookDirection: "Lead with one thing to pause, delegate, delay, or lower." }
    ]
  },
  {
    topicName: "High Functioning Anxiety",
    angles: [
      { name: "Capable but Anxious", description: "Looking successful while privately overwhelmed.", bestGoals: ["follower-growth", "trust-building", "shares"], hookDirection: "Start with being praised for what is exhausting you." },
      { name: "Productivity as Anxiety", description: "Planning, overworking, and checking as fear management.", bestGoals: ["thought-leadership", "education", "trust-building"], hookDirection: "Open with productivity as reassurance seeking." },
      { name: "Rest Guilt", description: "Feeling irresponsible when not producing.", bestGoals: ["follower-growth", "saves", "shares"], hookDirection: "Start with guilt during downtime." },
      { name: "Overpreparing", description: "Trying to prepare enough to feel safe.", bestGoals: ["education", "trust-building", "therapy-inquiries"], hookDirection: "Open with a backup plan for the backup plan." },
      { name: "Reliable One", description: "The relational cost of being seen as the person who always handles it.", bestGoals: ["shares", "trust-building", "therapy-inquiries"], hookDirection: "Start with nobody checking on the person who always seems fine." },
      { name: "Uncertainty", description: "Difficulty tolerating unknowns and open loops.", bestGoals: ["education", "saves", "therapy-inquiries"], hookDirection: "Lead with the open loop your brain cannot leave alone." }
    ]
  },
  {
    topicName: "ADHD in Women",
    angles: [
      { name: "Masking", description: "Looking put together while privately overwhelmed.", bestGoals: ["follower-growth", "trust-building", "shares"], hookDirection: "Start with public competence and private overwhelm." },
      { name: "Executive Dysfunction", description: "Caring deeply but struggling to start, plan, or finish.", bestGoals: ["education", "saves", "trust-building"], hookDirection: "Open with caring and still not being able to do the task." },
      { name: "Time Blindness", description: "Losing time, underestimating steps, and late transitions.", bestGoals: ["education", "follower-growth", "saves"], hookDirection: "Start with leaving the house as many invisible tasks." },
      { name: "Rejection Sensitivity", description: "Big emotional reactions to criticism, exclusion, or tone.", bestGoals: ["follower-growth", "therapy-inquiries", "shares"], hookDirection: "Open with a neutral comment landing like rejection." },
      { name: "Late Diagnosis", description: "Relief, grief, self-forgiveness, and reinterpreting the past.", bestGoals: ["trust-building", "shares", "therapy-inquiries"], hookDirection: "Start with realizing you were not lazy." },
      { name: "Planner Shame", description: "Systems that start strong and vanish.", bestGoals: ["follower-growth", "saves", "product-sales"], hookDirection: "Open with buying the planner and forgetting it exists." }
    ]
  },
  {
    topicName: "Trauma Responses",
    angles: [
      { name: "Fight", description: "Anger, defensiveness, and urgency as protection.", bestGoals: ["education", "trust-building", "saves"], hookDirection: "Start with anger as the visible edge of threat." },
      { name: "Flight", description: "Busyness, escape, overworking, and leaving before feeling trapped.", bestGoals: ["education", "follower-growth", "trust-building"], hookDirection: "Open with staying busy to outrun a feeling." },
      { name: "Freeze", description: "Going blank, numb, silent, or unable to respond.", bestGoals: ["shares", "trust-building", "therapy-inquiries"], hookDirection: "Start with knowing what to say only after the conversation ends." },
      { name: "Fawn", description: "Appeasing, agreeing, and becoming easy to stay safe.", bestGoals: ["education", "shares", "therapy-inquiries"], hookDirection: "Open with agreeing while the body is scared." },
      { name: "Body Alarm", description: "The body reacting to reminders, not current danger.", bestGoals: ["education", "saves", "trust-building"], hookDirection: "Start with knowing you are safe and still feeling alarm." },
      { name: "Current Safety", description: "Grounding, orienting, and helping the body locate now.", bestGoals: ["saves", "education", "therapy-inquiries"], hookDirection: "Lead with a present-moment safety cue." }
    ]
  },
  {
    topicName: "Low Self Esteem",
    angles: [
      { name: "Compliments", description: "Deflecting praise, distrust, and discomfort with being seen.", bestGoals: ["follower-growth", "trust-building", "shares"], hookDirection: "Start with arguing with a compliment before it lands." },
      { name: "Comparison", description: "Measuring self against others and dismissing personal progress.", bestGoals: ["follower-growth", "saves", "trust-building"], hookDirection: "Open with one comparison that changes the whole mood." },
      { name: "Self-Talk", description: "Harsh inner narrator and neutral alternatives.", bestGoals: ["saves", "education", "product-sales"], hookDirection: "Lead with the phrase the inner critic uses." },
      { name: "Relationships", description: "Settling, overgiving, and accepting inconsistent care.", bestGoals: ["shares", "therapy-inquiries", "trust-building"], hookDirection: "Start with accepting less because it feels familiar." },
      { name: "Avoiding Opportunities", description: "Not applying, not asking, not trying because rejection feels certain.", bestGoals: ["education", "trust-building", "saves"], hookDirection: "Open with rejecting yourself before anyone else can." },
      { name: "Core Beliefs", description: "Old self-stories that feel true because they are familiar.", bestGoals: ["education", "thought-leadership", "therapy-inquiries"], hookDirection: "Start with a harsh thought that feels like fact." }
    ]
  },
  {
    topicName: "Emotional Avoidance",
    angles: [
      { name: "Staying Busy", description: "Productivity, cleaning, work, or errands as emotional distance.", bestGoals: ["follower-growth", "trust-building", "shares"], hookDirection: "Start with getting productive every time sadness gets close." },
      { name: "Intellectualizing", description: "Explaining feelings without feeling them.", bestGoals: ["education", "trust-building", "therapy-inquiries"], hookDirection: "Open with describing pain like a case study." },
      { name: "Numbing", description: "Scrolling, sleeping, eating, working, or zoning out to avoid emotion.", bestGoals: ["awareness", "saves", "therapy-inquiries"], hookDirection: "Start with reaching for the phone when silence gets loud." },
      { name: "Shutdown", description: "Going blank, quiet, or disconnected during emotional stress.", bestGoals: ["shares", "trust-building", "education"], hookDirection: "Open with I am fine meaning I cannot touch that feeling yet." },
      { name: "What Helps", description: "Small doses of feeling, body cues, and tolerating emotion safely.", bestGoals: ["saves", "education", "therapy-inquiries"], hookDirection: "Lead with a two-minute feeling practice." },
      { name: "Solving vs Feeling", description: "Advice-giving, fixing, or problem-solving instead of emotional presence.", bestGoals: ["thought-leadership", "shares", "education"], hookDirection: "Start with offering solutions when the emotion needs space." }
    ]
  }
];

export function getContentAngles(topic: string) {
  const closestTopic = findClosestTopic(topic);
  if (!closestTopic) return defaultAngles;
  return TOPIC_CONTENT_ANGLES.find((profile) => profile.topicName === closestTopic.topicName)?.angles || defaultAngles;
}

export function selectBestAngle(topic: string, goal: string, usedAngles: string[] = []) {
  const angles = getContentAngles(topic);
  const goalConfig = getContentGoalConfig(goal);
  const used = new Set(usedAngles.map((angle) => angle.toLowerCase()));
  const available = angles.filter((angle) => !used.has(angle.name.toLowerCase()));
  const pool = available.length ? available : angles;

  const scored = pool.map((angle) => {
    const goalScore = angle.bestGoals.includes(goal) ? 50 : 0;
    const contentScore = goalConfig.emphasize.some((term) => `${angle.name} ${angle.description}`.toLowerCase().includes(term.toLowerCase())) ? 15 : 0;
    return { angle, score: goalScore + contentScore };
  });

  return scored.sort((a, b) => b.score - a.score)[0]?.angle || pool[0] || defaultAngles[0];
}

export function selectAnglesForGeneration(topic: string, goal: string, count: number) {
  const selected: ContentAngle[] = [];
  for (let index = 0; index < count; index += 1) {
    selected.push(selectBestAngle(topic, goal, selected.map((angle) => angle.name)));
  }
  return selected;
}
