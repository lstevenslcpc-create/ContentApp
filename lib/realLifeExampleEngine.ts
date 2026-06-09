import { getContentGoalConfig } from "./contentGoalConfig";
import { findClosestTopic } from "./topicIntelligence";

export type RealLifeExampleCategory =
  | "thoughts"
  | "emotions"
  | "bodySensations"
  | "behaviors"
  | "commonPhrases"
  | "parentObservations"
  | "relationshipExamples"
  | "schoolExamples"
  | "workExamples"
  | "socialMediaTextingExamples"
  | "hiddenSigns"
  | "mistakenFor";

export type RealLifeExampleProfile = {
  topicName: string;
  aliases: string[];
  thoughts: string[];
  emotions: string[];
  bodySensations: string[];
  behaviors: string[];
  commonPhrases: string[];
  parentObservations: string[];
  relationshipExamples: string[];
  schoolExamples: string[];
  workExamples: string[];
  socialMediaTextingExamples: string[];
  hiddenSigns: string[];
  mistakenFor: string[];
};

export type ExampleBrief = {
  thoughts: string[];
  emotions: string[];
  behaviors: string[];
  bodySigns: string[];
  realLifeExamples: string[];
  whatThisCanLookLike: string[];
};

const profiles: RealLifeExampleProfile[] = [
  {
    topicName: "Teen Anxiety",
    aliases: ["teen anxiety", "teen mental health", "school anxiety"],
    thoughts: ["Everyone is going to notice", "I cannot mess this up", "My friends are mad and I do not know why", "If I tell my parents, they will make it bigger", "I should be able to handle this"],
    emotions: ["embarrassed", "overwhelmed", "irritable", "ashamed", "lonely in a crowded school"],
    bodySensations: ["stomach aches before class", "tight throat before asking for help", "headaches after masking all day", "racing heart before a presentation", "heavy tiredness after school"],
    behaviors: ["irritability after school", "avoiding homework", "saying I am fine", "shutting down when asked questions", "perfectionism around grades", "asking to stay home frequently"],
    commonPhrases: ["I am fine", "I do not know", "Can I stay home today", "Everyone is annoying me", "It does not matter"],
    parentObservations: ["snapping after school but acting fine around friends", "staring at an assignment without starting", "complaining of stomach aches on school mornings", "asking repeated reassurance questions", "withdrawing when parents ask too many questions"],
    relationshipExamples: ["assuming a friend is upset after a short reply", "over-apologizing after small conflict", "pulling away from friends to avoid rejection", "feeling left out after seeing a group photo", "changing personality to stay liked"],
    schoolExamples: ["freezing during a test after one hard question", "avoiding a teacher after missing an assignment", "feeling sick before a presentation", "checking grades repeatedly", "procrastinating because the project feels emotionally loaded"],
    workExamples: ["overpreparing for a first job shift", "feeling panicked after a manager gives neutral feedback", "calling out because social pressure feels too intense", "checking the schedule repeatedly", "apologizing too much after a small mistake"],
    socialMediaTextingExamples: ["rereading a friend's message for tone", "scrolling to numb after school stress", "watching study routine videos and feeling worse", "posting like everything is fine", "checking if friends are active without replying"],
    hiddenSigns: ["masking distress at school", "quietly comparing themselves to classmates", "needing exact plans to feel safe", "staying busy to avoid feelings", "melting down at home after holding it together"],
    mistakenFor: ["attitude", "laziness", "defiance", "not caring", "being dramatic"]
  },
  {
    topicName: "Anxious Attachment",
    aliases: ["anxious attachment", "relationship anxiety", "attachment anxiety"],
    thoughts: ["Did I say something wrong", "Why do they feel different", "Are they pulling away", "Maybe I am too much", "I need to fix this before I can focus"],
    emotions: ["panic", "shame", "longing", "confusion", "fear of rejection"],
    bodySensations: ["stomach dropping", "chest tightness", "shaky feeling", "racing thoughts", "panic after silence"],
    behaviors: ["rereading texts", "checking for tone changes", "overexplaining after conflict", "asking for reassurance", "feeling unable to focus until they respond"],
    commonPhrases: ["Are we okay", "Sorry if that was too much", "I know I am probably overthinking", "You seem different", "Never mind, it is fine"],
    parentObservations: ["needing repeated reassurance after separation", "asking if someone is mad after a tone shift", "following a caregiver after tension", "crying when a pickup is late", "feeling rejected by normal independence"],
    relationshipExamples: ["a delayed reply becomes a story about being replaced", "a disagreement feels like the relationship is ending", "a partner's quiet mood becomes proof something is wrong", "asking for clarity and then feeling ashamed", "testing whether someone cares by pulling away"],
    schoolExamples: ["assuming a friend is done with them after lunch changes", "replaying hallway interactions", "panicking when group plans change", "needing a teacher's approval after a mistake", "reading silence as rejection"],
    workExamples: ["thinking a short email means trouble", "checking Slack status after sending a message", "overexplaining a small mistake", "struggling to focus after neutral feedback", "feeling rejected by a coworker's mood"],
    socialMediaTextingExamples: ["checking timestamps", "watching stories while waiting for a reply", "reading likes as proof of closeness or distance", "drafting and deleting a message", "posting indirectly to see if they respond"],
    hiddenSigns: ["editing texts to sound less needy", "tracking tiny shifts in warmth", "feeling ashamed after asking for reassurance", "trying to earn calm through perfection", "acting easygoing while panicking inside"],
    mistakenFor: ["neediness", "drama", "overreacting", "clinginess", "being controlling"]
  },
  {
    topicName: "People Pleasing",
    aliases: ["people pleasing", "fawn response", "approval seeking"],
    thoughts: ["If they are upset, it is my fault", "Saying no makes me selfish", "I need them to understand", "It is easier if I just do it", "I can handle being uncomfortable better than they can"],
    emotions: ["guilt", "resentment", "fear", "pressure", "exhaustion"],
    bodySensations: ["tight chest before saying no", "stomach twist after disappointing someone", "hot face during conflict", "heavy fatigue after overgiving", "restlessness until everyone seems okay"],
    behaviors: ["saying yes before checking capacity", "over-apologizing", "overexplaining boundaries", "monitoring facial expressions", "agreeing to avoid tension"],
    commonPhrases: ["No worries", "Whatever works for you", "I am sorry, this is probably annoying", "It is fine", "I can do it"],
    parentObservations: ["being praised as easy while hiding needs", "taking responsibility for adult moods", "avoiding preferences", "helping quickly to prevent disappointment", "getting anxious when someone is upset"],
    relationshipExamples: ["letting the other person choose everything", "agreeing during conflict and resenting it later", "hiding needs to stay liked", "feeling loved only when useful", "overgiving to earn closeness"],
    schoolExamples: ["doing most of the group project", "letting classmates copy work", "not telling a teacher they are overwhelmed", "volunteering for too much", "staying quiet to avoid being difficult"],
    workExamples: ["taking on one more task", "answering after-hours messages", "softening every direct sentence", "saying yes in a meeting and panicking later", "covering for others to stay liked"],
    socialMediaTextingExamples: ["replying immediately to avoid seeming rude", "deleting a post someone might misunderstand", "editing captions until they sound harmless", "using too many exclamation points to soften a no", "checking reactions for approval"],
    hiddenSigns: ["resentment after a yes", "not knowing what they want", "confusing guilt with danger", "calling fear kindness", "losing identity in relationships"],
    mistakenFor: ["kindness", "being easygoing", "team player behavior", "maturity", "selflessness"]
  },
  {
    topicName: "Perfectionism",
    aliases: ["perfectionism", "fear of failure", "perfectionist anxiety"],
    thoughts: ["If it is not excellent, it does not count", "I should have known better", "One mistake changes everything", "I cannot start until I know I can do it right", "People will see I am not good enough"],
    emotions: ["shame", "pressure", "fear", "irritability", "temporary relief after checking"],
    bodySensations: ["tight shoulders while working", "stomach drop after feedback", "racing thoughts before starting", "jaw clenching during edits", "restlessness when resting"],
    behaviors: ["rewriting an email 6 times", "procrastinating from fear", "overpreparing", "rechecking work repeatedly", "avoiding hobbies they are not good at"],
    commonPhrases: ["It is not ready", "I should have done better", "I cannot mess this up", "This is not good enough", "I am just detail-oriented"],
    parentObservations: ["melting down over a small mistake", "refusing to try if they might not be good", "asking for repeated checking", "crumpling imperfect work", "equating grades with worth"],
    relationshipExamples: ["hiding mistakes from loved ones", "getting defensive around feedback", "trying to be the perfect partner", "feeling unlovable after disappointing someone", "choosing performance over vulnerability"],
    schoolExamples: ["formatting notes instead of studying", "turning in work late because it is not perfect", "panicking over a 92", "not raising a hand unless certain", "avoiding classes where effort is visible"],
    workExamples: ["missing deadlines because the draft is not perfect", "overpreparing for a routine meeting", "checking spreadsheets repeatedly", "staying late to polish small details", "feeling exposed by one edit"],
    socialMediaTextingExamples: ["not posting because the feed is not cohesive", "deleting a typo and feeling embarrassed", "rewriting captions repeatedly", "comparing drafts to creators", "saving ideas but never publishing"],
    hiddenSigns: ["resting only after earning it", "calling anxiety high standards", "avoiding beginner status", "struggling to celebrate progress", "self-criticism before others can criticize"],
    mistakenFor: ["ambition", "discipline", "high standards", "being responsible", "motivation"]
  },
  {
    topicName: "Burnout",
    aliases: ["burnout", "emotional exhaustion", "caregiver burnout"],
    thoughts: ["I cannot drop anything", "If I stop everything will collapse", "Rest will make me fall behind", "I should be grateful", "I have nothing left"],
    emotions: ["resentment", "numbness", "guilt", "grief", "irritability"],
    bodySensations: ["heavy exhaustion after waking", "head pressure from constant demands", "tight chest at notifications", "body sinking when email opens", "overstimulation from noise"],
    behaviors: ["sitting in the car before going inside", "avoiding texts", "snapping over small requests", "doom scrolling for relief", "forgetting basic needs"],
    commonPhrases: ["I just need everyone to stop needing me", "I am so tired", "I cannot think", "I should be able to handle this", "I do not even know what I need"],
    parentObservations: ["crying in the pantry", "getting angry over one more spill", "feeling touched out", "wanting quiet from people they love", "losing patience faster than usual"],
    relationshipExamples: ["pulling away from affection because touch feels like another demand", "resenting normal needs", "not texting back because every reply feels like work", "feeling unseen by a partner", "overfunctioning then crashing"],
    schoolExamples: ["staring at the laptop while an assignment feels impossible", "missing deadlines after months of high performance", "dropping activities that used to matter", "feeling detached in class", "needing silence after school"],
    workExamples: ["dreading meetings", "making simple mistakes", "working through lunch", "feeling sick before opening email", "losing creativity"],
    socialMediaTextingExamples: ["scrolling for an hour and feeling worse", "muting group chats", "saving self-care posts without capacity to use them", "posting productivity while feeling empty", "ignoring messages for days"],
    hiddenSigns: ["numbness toward things that used to matter", "resentment about ordinary requests", "fantasizing about disappearing", "loss of creativity", "rest that does not restore"],
    mistakenFor: ["laziness", "bad attitude", "lack of gratitude", "poor time management", "not caring"]
  },
  {
    topicName: "High Functioning Anxiety",
    aliases: ["high-functioning anxiety", "high functioning anxiety", "productive anxiety"],
    thoughts: ["If I stop I will fall behind", "People only value me because I am reliable", "I need to prepare for every outcome", "One mistake will expose me", "I should not be anxious because I am doing well"],
    emotions: ["pressure", "fear", "restlessness", "loneliness", "hidden shame"],
    bodySensations: ["tense shoulders", "racing thoughts at bedtime", "shallow breathing while planning", "tight chest despite success", "restless energy during downtime"],
    behaviors: ["checking calendars before bed", "overpreparing", "answering quickly", "turning breaks into productivity", "building backup plans for backup plans"],
    commonPhrases: ["I am fine, just busy", "I can handle it", "I just like to be prepared", "I do not know how to relax", "It is easier if I do it myself"],
    parentObservations: ["being praised as responsible while anxious", "needing exact plans", "crying over small changes", "trying to be the good kid", "overachieving to feel safe"],
    relationshipExamples: ["being the reliable one", "struggling to receive care", "feeling unseen because competence hides distress", "resenting others while refusing help", "performing okayness"],
    schoolExamples: ["checking portals repeatedly", "joining too many activities", "overstudying", "feeling behind despite starting early", "asking clarifying questions to prevent mistakes"],
    workExamples: ["responding to emails immediately", "overpreparing for simple updates", "staying late to prevent tomorrow's anxiety", "feeling like a fraud after feedback", "monitoring every open loop"],
    socialMediaTextingExamples: ["posting polished moments while panicked", "saving routines to feel in control", "comparing productivity systems", "drafting vulnerable posts and deleting them", "checking messages instantly"],
    hiddenSigns: ["being praised for coping strategies that exhaust them", "using achievement to manage fear", "guilt during downtime", "needing control to feel safe", "calling anxiety discipline"],
    mistakenFor: ["being organized", "being ambitious", "discipline", "motivation", "having it all together"]
  },
  {
    topicName: "Emotional Shutdown",
    aliases: ["emotional shutdown", "shutdown", "going numb"],
    thoughts: ["I cannot deal with this right now", "If I feel it I will fall apart", "I do not have words", "I need to disappear", "Nothing is coming out"],
    emotions: ["numb", "overwhelmed", "ashamed", "distant", "frozen"],
    bodySensations: ["heavy limbs", "blank mind", "tight throat", "numb chest", "slow or distant feeling"],
    behaviors: ["going quiet during conflict", "sleeping after emotional stress", "saying I do not know", "avoiding eye contact", "needing space before talking"],
    commonPhrases: ["I do not know", "I am fine", "Can we not talk about this", "Nothing is wrong", "I just need to be alone"],
    parentObservations: ["a teen shutting down when asked questions", "a child going silent after correction", "appearing calm but unreachable", "needing quiet after school", "crying only after everyone leaves"],
    relationshipExamples: ["freezing when a partner asks what is wrong", "pulling away after vulnerability", "not replying because words feel impossible", "seeming cold while overwhelmed", "needing repair after space"],
    schoolExamples: ["going blank when called on", "not being able to explain missing work", "shutting down after feedback", "sitting quietly while panicking", "avoiding the counselor because talking makes it real"],
    workExamples: ["going silent in feedback meetings", "staring at a task without starting", "not answering messages after conflict", "feeling numb after criticism", "needing time before responding"],
    socialMediaTextingExamples: ["leaving messages unread", "typing and deleting because nothing sounds right", "scrolling without absorbing anything", "posting memes instead of saying what hurts", "muting conversations"],
    hiddenSigns: ["appearing calm while disconnected", "not knowing what they feel", "needing isolation to recover", "losing access to words", "feeling embarrassed after freezing"],
    mistakenFor: ["coldness", "not caring", "stonewalling", "rudeness", "lack of motivation"]
  },
  {
    topicName: "Conflict Avoidance",
    aliases: ["conflict avoidance", "avoiding conflict", "fear of conflict"],
    thoughts: ["If I say this, they will leave", "It is not worth it", "I will make it worse", "I should just get over it", "Their anger means I did something wrong"],
    emotions: ["fear", "dread", "guilt", "resentment", "anxiety"],
    bodySensations: ["tight chest before speaking", "stomach knot during tension", "hot face when disagreeing", "shaky voice", "freeze response when confronted"],
    behaviors: ["saying it is fine", "changing the subject", "agreeing too quickly", "holding resentment silently", "apologizing to end tension"],
    commonPhrases: ["It is fine", "Forget I said anything", "I do not want to fight", "Whatever you want", "I am sorry, never mind"],
    parentObservations: ["a child becoming agreeable when adults are tense", "a teen avoiding hard conversations", "sibling conflict ending with one child always giving in", "apologizing quickly without understanding why", "hiding mistakes"],
    relationshipExamples: ["not naming hurt until resentment builds", "agreeing in the moment and feeling angry later", "avoiding repair because the first conversation felt scary", "choosing distance over directness", "testing instead of asking"],
    schoolExamples: ["not telling a teacher about a problem", "letting peers cross boundaries", "avoiding group disagreement", "not reporting bullying", "staying quiet to keep the peace"],
    workExamples: ["not asking for clarification", "agreeing to unrealistic deadlines", "avoiding feedback conversations", "not correcting a misunderstanding", "feeling sick before a difficult email"],
    socialMediaTextingExamples: ["drafting a boundary and deleting it", "using passive likes instead of direct repair", "muting someone instead of addressing hurt", "sending a soft message that hides the real point", "rereading before sending anything honest"],
    hiddenSigns: ["resentment after silence", "body panic before disagreement", "over-apologizing", "confusing peace with safety", "losing preferences in relationships"],
    mistakenFor: ["being easygoing", "maturity", "not having needs", "forgiveness", "kindness"]
  },
  {
    topicName: "Trauma Responses",
    aliases: ["trauma responses", "fight flight freeze fawn"],
    thoughts: ["I need to get out", "If I keep them calm I will be safe", "I cannot think", "Something bad is about to happen", "I should be past this"],
    emotions: ["fear", "numbness", "anger", "shame", "hypervigilance"],
    bodySensations: ["body alarm", "tight chest", "frozen limbs", "buzzing energy", "numb or far away feeling"],
    behaviors: ["going blank in conflict", "appeasing someone quickly", "snapping when cornered", "staying busy to escape feelings", "scanning exits or moods"],
    commonPhrases: ["I know I am safe but my body does not", "I froze", "I just agreed so it would stop", "I cannot tell if it is intuition or trauma", "I overreacted"],
    parentObservations: ["a child hiding after a mistake", "laughing when scared", "going silent when voices get loud", "becoming overly helpful when tension rises", "needing control after unpredictability"],
    relationshipExamples: ["fawning during conflict", "pulling away after closeness", "mistaking intensity for safety", "freezing when asked what is wrong", "overexplaining to prevent anger"],
    schoolExamples: ["shutting down when corrected publicly", "being hyperaware of a teacher's tone", "asking to leave noisy spaces", "going blank during conflict", "avoiding reminders"],
    workExamples: ["reading short feedback as danger", "unable to speak in reviews", "working too hard to avoid criticism", "feeling exhausted after scanning meetings", "needing control over every detail"],
    socialMediaTextingExamples: ["muting triggering content", "posting humor about pain", "reading comments for criticism", "saving grounding posts", "avoiding messages that feel tense"],
    hiddenSigns: ["laughing during discomfort", "becoming overly agreeable", "needing control to feel safe", "numbing after stress", "overexplaining to prevent anger"],
    mistakenFor: ["overreacting", "being difficult", "not caring", "being controlling", "rudeness"]
  },
  {
    topicName: "Depression in Teens",
    aliases: ["depression in teens", "teen depression", "depressed teen"],
    thoughts: ["Nothing matters", "I am tired of trying", "Everyone would be better without my mood", "I cannot explain it", "I used to care but now I do not"],
    emotions: ["numb", "hopeless", "irritable", "lonely", "ashamed"],
    bodySensations: ["heavy body", "sleeping too much or too little", "low appetite or stress eating", "constant fatigue", "slowed down feeling"],
    behaviors: ["withdrawing from friends", "dropping activities", "sleeping after school", "letting assignments pile up", "saying I do not care"],
    commonPhrases: ["I am just tired", "It does not matter", "Leave me alone", "I do not care", "I am fine"],
    parentObservations: ["loss of interest in activities", "more irritability than sadness", "messier room than usual", "sleep changes", "less texting or socializing"],
    relationshipExamples: ["not replying because connection feels exhausting", "assuming friends are better off without them", "pulling away from people they miss", "feeling guilty for being low-energy", "conflict over isolation"],
    schoolExamples: ["grades dropping after loss of motivation", "staring at work without starting", "skipping clubs", "sleeping in class", "not turning in completed work"],
    workExamples: ["calling out from a part-time job", "feeling too slow to keep up", "forgetting shifts", "losing interest in saving money", "feeling overwhelmed by simple tasks"],
    socialMediaTextingExamples: ["scrolling for hours without enjoyment", "leaving friends on read", "posting old photos to look okay", "saving sad quotes", "muting group chats"],
    hiddenSigns: ["irritability instead of sadness", "numbness", "loss of interest", "fatigue after simple tasks", "saying I am fine while disconnecting"],
    mistakenFor: ["laziness", "attitude", "not caring", "normal teen moodiness", "lack of discipline"]
  }
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreItem(item: string, angle: string, goal: string) {
  const normalizedItem = normalize(item);
  const normalizedAngle = normalize(angle);
  const goalConfig = getContentGoalConfig(goal);
  const angleWords = normalizedAngle.split(" ").filter((word) => word.length > 2);
  const angleScore = angleWords.reduce((score, word) => score + (normalizedItem.includes(word) ? 6 : 0), 0);
  const goalScore = goalConfig.emphasize.reduce((score, term) => score + (normalizedItem.includes(normalize(term)) ? 3 : 0), 0);
  return angleScore + goalScore;
}

function selectItems(items: string[], angle: string, goal: string, count: number) {
  return [...items]
    .map((item, index) => ({ item, score: scoreItem(item, angle, goal), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map((entry) => entry.item);
}

export function getRealLifeExamples(topic: string) {
  const closestTopic = findClosestTopic(topic);
  const normalizedTopic = normalize(topic);
  return profiles.find((profile) => profile.topicName === closestTopic?.topicName)
    || profiles.find((profile) => profile.aliases.some((alias) => normalize(alias) === normalizedTopic))
    || null;
}

export function selectExamplesForAngle(topic: string, angle: string, goal: string): ExampleBrief {
  const profile = getRealLifeExamples(topic);
  if (!profile) {
    return {
      thoughts: [],
      emotions: [],
      behaviors: [],
      bodySigns: [],
      realLifeExamples: [],
      whatThisCanLookLike: []
    };
  }

  const realLifeExamples = [
    ...selectItems(profile.schoolExamples, angle, goal, 2),
    ...selectItems(profile.relationshipExamples, angle, goal, 2),
    ...selectItems(profile.workExamples, angle, goal, 1),
    ...selectItems(profile.socialMediaTextingExamples, angle, goal, 1)
  ];

  return {
    thoughts: selectItems(profile.thoughts, angle, goal, 4),
    emotions: selectItems(profile.emotions, angle, goal, 4),
    behaviors: selectItems(profile.behaviors, angle, goal, 5),
    bodySigns: selectItems(profile.bodySensations, angle, goal, 4),
    realLifeExamples,
    whatThisCanLookLike: [
      ...selectItems(profile.hiddenSigns, angle, goal, 3),
      ...selectItems(profile.parentObservations, angle, goal, 2),
      ...selectItems(profile.mistakenFor.map((item) => `mistaken for ${item}`), angle, goal, 2),
      ...selectItems(profile.commonPhrases.map((item) => `saying "${item}"`), angle, goal, 2)
    ]
  };
}

export function buildExampleBrief(topic: string, angle: string, goal: string) {
  return selectExamplesForAngle(topic, angle, goal);
}
