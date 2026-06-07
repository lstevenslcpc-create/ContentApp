import { getContentGoalConfig } from "./contentGoalConfig";
import { findClosestTopic } from "./topicIntelligence";

export type PsychologyFrameworkName =
  | "Attachment Theory"
  | "Nervous System / Threat Response"
  | "CBT Thought-Feeling-Behavior Cycle"
  | "Avoidance Cycle"
  | "Exposure / Behavioral Activation"
  | "Trauma Responses"
  | "DBT Emotion Regulation"
  | "Family Systems"
  | "Self-Compassion"
  | "Boundaries"
  | "ADHD Executive Function";

export type PsychologyFramework = {
  frameworkName: PsychologyFrameworkName;
  simpleExplanation: string;
  therapistExplanation: string;
  socialMediaExplanation: string;
  whenToUse: string[];
  examples: string[];
  contentAnglesBestFor: string[];
  avoidMisuseNotes: string[];
};

export type FrameworkBrief = {
  selectedFramework: string;
  whyThisFrameworkFits: string;
  frameworkExplanation: string;
  practicalApplication: string;
  frameworks: PsychologyFramework[];
};

const frameworks: PsychologyFramework[] = [
  {
    frameworkName: "Attachment Theory",
    simpleExplanation: "Attachment patterns shape how safe, close, or threatened people feel in relationships.",
    therapistExplanation: "Attachment theory helps explain proximity seeking, fear of abandonment, repair needs, emotional activation, and learned relational expectations.",
    socialMediaExplanation: "This explains why a small relational cue can feel much bigger when the attachment system reads it as disconnection.",
    whenToUse: ["relationship anxiety", "fear of rejection", "conflict", "mood changes", "reassurance seeking", "dating patterns", "family roles"],
    examples: ["delayed replies feeling like rejection", "overexplaining during conflict", "testing whether someone cares", "feeling shame after needing reassurance"],
    contentAnglesBestFor: ["Texting", "Conflict", "Mood Changes", "Fear of Rejection", "Reassurance Seeking", "Dating Patterns", "Shame After Needs", "Family Roles"],
    avoidMisuseNotes: ["Do not label someone as anxiously attached as a diagnosis.", "Do not imply attachment style is permanent.", "Do not blame the person for wanting closeness."]
  },
  {
    frameworkName: "Nervous System / Threat Response",
    simpleExplanation: "The body can react to perceived danger before logic has time to catch up.",
    therapistExplanation: "Threat response framing explains somatic activation, scanning, freeze, fight, flight, fawn, and the gap between cognitive awareness and body alarm.",
    socialMediaExplanation: "This explains why the body can feel unsafe even when the mind knows the situation may not be dangerous.",
    whenToUse: ["body panic", "stomach aches", "irritability", "shutdown", "hypervigilance", "burnout", "trauma", "teen anxiety"],
    examples: ["stomach aches before school", "tight chest after a delayed text", "snapping after masking all day", "going blank in conflict"],
    contentAnglesBestFor: ["Body Panic", "Stomach Aches", "Irritability", "Mood Changes", "Body Alarm", "Freeze", "Fight", "Flight", "Fawn", "Hidden Burnout Signs", "Masking All Day"],
    avoidMisuseNotes: ["Do not overstate nervous system claims as medical certainty.", "Do not make regulation sound like a quick fix.", "Do not ignore context, relationships, or practical supports."]
  },
  {
    frameworkName: "CBT Thought-Feeling-Behavior Cycle",
    simpleExplanation: "Thoughts, feelings, body sensations, and behaviors can reinforce one another.",
    therapistExplanation: "The CBT cycle helps connect interpretations, emotional responses, physical sensations, and coping behaviors in a way clients can observe and shift.",
    socialMediaExplanation: "This framework helps people see the loop: what happened, what the mind said, what the body felt, and what they did next.",
    whenToUse: ["overthinking", "perfectionism", "low self esteem", "anxiety vs laziness", "core beliefs", "comparison"],
    examples: ["a short text becomes a rejection story", "one grade becomes proof of failure", "one criticism becomes a whole self-belief"],
    contentAnglesBestFor: ["Overthinking", "Perfectionism", "Anxiety vs Laziness", "Core Beliefs", "Comparison", "Self-Talk", "Fear of Failure", "Observation vs Story"],
    avoidMisuseNotes: ["Do not imply thoughts alone cause all symptoms.", "Do not make clients feel blamed for automatic thoughts.", "Do not skip body cues or environmental stressors."]
  },
  {
    frameworkName: "Avoidance Cycle",
    simpleExplanation: "Avoidance lowers distress short term but teaches the brain to fear the situation more over time.",
    therapistExplanation: "Avoidance is negatively reinforced by immediate relief, which can maintain anxiety, reduce mastery, and shrink tolerated life activities.",
    socialMediaExplanation: "Avoiding it may calm anxiety today, but it often gives anxiety more power tomorrow.",
    whenToUse: ["avoidance", "school anxiety", "emotional avoidance", "procrastination", "anxiety vs laziness"],
    examples: ["staying home from school", "not opening an assignment", "avoiding an email", "scrolling when a feeling gets close"],
    contentAnglesBestFor: ["Avoidance", "School Anxiety", "Anxiety vs Laziness", "Procrastination", "Staying Busy", "Numbing", "Emotional Avoidance"],
    avoidMisuseNotes: ["Do not shame avoidance.", "Do not suggest forcing exposure without safety or support.", "Do not ignore real barriers or unsafe environments."]
  },
  {
    frameworkName: "Exposure / Behavioral Activation",
    simpleExplanation: "Small, planned actions can help the body relearn safety and rebuild momentum.",
    therapistExplanation: "Exposure and behavioral activation use gradual, values-aligned action to reduce avoidance, increase mastery, and create corrective emotional learning.",
    socialMediaExplanation: "The goal is not to throw yourself into the hardest thing. It is to practice one tolerable step.",
    whenToUse: ["what helps", "school anxiety", "good enough", "avoiding opportunities", "depression", "burnout recovery"],
    examples: ["starting homework for two minutes", "sending the good-enough email", "taking one small social step", "doing one meaningful task before confidence arrives"],
    contentAnglesBestFor: ["What Helps", "Good Enough", "School Anxiety", "Avoiding Opportunities", "Current Safety", "Rest Not Working"],
    avoidMisuseNotes: ["Do not present exposure as pushing through at all costs.", "Do not use this for unsafe situations.", "Do not ignore pacing, consent, or readiness."]
  },
  {
    frameworkName: "Trauma Responses",
    simpleExplanation: "Fight, flight, freeze, and fawn are protective responses the body may use under threat.",
    therapistExplanation: "Trauma response framing helps explain automatic survival strategies, implicit memory, body alarm, and protective behaviors that may persist after danger has passed.",
    socialMediaExplanation: "This framework helps people see a reaction as protection, not proof that something is wrong with them.",
    whenToUse: ["fight", "flight", "freeze", "fawn", "people pleasing", "body alarm", "trauma responses"],
    examples: ["going blank in conflict", "appeasing someone to stay safe", "getting busy to outrun a feeling", "snapping when cornered"],
    contentAnglesBestFor: ["Fight", "Flight", "Freeze", "Fawn", "Body Alarm", "Fawn Response", "People Pleasing", "What Makes It Worse"],
    avoidMisuseNotes: ["Do not use trauma language to diagnose strangers.", "Do not make graphic trauma references.", "Do not imply every stress response is trauma."]
  },
  {
    frameworkName: "DBT Emotion Regulation",
    simpleExplanation: "Emotion regulation helps people notice feelings, understand what they need, and choose a steadier response.",
    therapistExplanation: "DBT emotion regulation and distress tolerance skills support naming emotions, reducing vulnerability factors, tolerating distress, and acting effectively.",
    socialMediaExplanation: "This teaches people what to do between the feeling and the reaction.",
    whenToUse: ["reassurance seeking", "conflict", "shutdown", "what helps", "solving vs feeling", "body panic"],
    examples: ["naming the cue before sending the panic text", "pausing before overexplaining", "using a two-minute feeling practice", "asking for repair directly"],
    contentAnglesBestFor: ["What Helps", "Reassurance Seeking", "Conflict", "Shutdown", "Solving vs Feeling", "Secure Communication", "Current Safety"],
    avoidMisuseNotes: ["Do not make regulation sound like suppressing feelings.", "Do not suggest skills replace therapy for high-risk concerns.", "Do not overcomplicate social captions with acronyms."]
  },
  {
    frameworkName: "Family Systems",
    simpleExplanation: "People often learn roles in families, and those roles can shape behavior later.",
    therapistExplanation: "Family systems framing helps explain relational roles, emotional labor, boundaries, triangulation, parent-child patterns, and the function of behavior inside a system.",
    socialMediaExplanation: "This explains why being the easy one, helper, or problem child can become an identity people keep carrying.",
    whenToUse: ["parent mistakes", "family roles", "teen anxiety", "people pleasing", "parenting", "emotional labor"],
    examples: ["the easy kid hiding anxiety", "a parent mistaking shutdown for defiance", "the helper becoming responsible for everyone's moods"],
    contentAnglesBestFor: ["Parent Mistakes", "Family Roles", "Anxiety vs Defiance", "Teen Anxiety", "Mom Burnout", "Invisible Labor"],
    avoidMisuseNotes: ["Do not blame parents broadly.", "Do not simplify family dynamics into one cause.", "Do not ignore safety concerns or individual differences."]
  },
  {
    frameworkName: "Self-Compassion",
    simpleExplanation: "Self-compassion helps people respond to pain or mistakes without attacking themselves.",
    therapistExplanation: "Self-compassion reduces shame, supports repair, and helps clients practice accountability without self-punishment.",
    socialMediaExplanation: "This helps people replace the cruel narrator with a more accurate one.",
    whenToUse: ["low self esteem", "perfectionism", "feedback shame", "compliments", "self-talk", "late diagnosis"],
    examples: ["not making one mistake your whole identity", "using neutral self-talk", "letting a compliment land without arguing", "grieving a late diagnosis without self-blame"],
    contentAnglesBestFor: ["Self-Talk", "Compliments", "Feedback Shame", "Late Diagnosis", "Fear of Failure", "Good Enough"],
    avoidMisuseNotes: ["Do not turn self-compassion into forced positivity.", "Do not imply accountability is unnecessary.", "Do not use generic affirmation language."]
  },
  {
    frameworkName: "Boundaries",
    simpleExplanation: "Boundaries clarify what someone can offer, needs, or will no longer carry.",
    therapistExplanation: "Boundary work supports differentiation, self-respect, relational clarity, and reduced resentment without requiring control over another person's response.",
    socialMediaExplanation: "This teaches people that a boundary can be kind, short, and still disappointing to someone.",
    whenToUse: ["people pleasing", "boundary guilt", "workplace people pleasing", "secure communication", "burnout", "relationships"],
    examples: ["saying no without a paragraph", "not managing someone else's disappointment", "asking directly for clarity", "delegating an invisible load"],
    contentAnglesBestFor: ["Boundary Guilt", "Workplace People Pleasing", "Secure Communication", "What Helps", "Invisible Labor", "Kindness vs Self-Abandonment"],
    avoidMisuseNotes: ["Do not use boundaries as a control tactic.", "Do not shame people who need time to practice boundaries.", "Do not ignore power dynamics."]
  },
  {
    frameworkName: "ADHD Executive Function",
    simpleExplanation: "Executive function helps with starting, organizing, remembering, prioritizing, and switching tasks.",
    therapistExplanation: "ADHD executive function framing explains task initiation, working memory, time blindness, emotional regulation, planning, and performance variability.",
    socialMediaExplanation: "This explains why caring about the task does not always make starting it accessible.",
    whenToUse: ["adhd in women", "executive dysfunction", "time blindness", "planner shame", "anxiety vs adhd"],
    examples: ["buying the planner and forgetting it exists", "knowing the assignment but not turning it in", "leaving the house as many invisible steps"],
    contentAnglesBestFor: ["Executive Dysfunction", "Time Blindness", "Planner Shame", "Anxiety vs ADHD", "Masking"],
    avoidMisuseNotes: ["Do not reduce ADHD to distraction.", "Do not use ADHD to excuse harm without repair.", "Do not confuse executive dysfunction with lack of caring."]
  }
];

const topicFrameworkPreferences: Record<string, PsychologyFrameworkName[]> = {
  "Teen Anxiety": ["Nervous System / Threat Response", "Avoidance Cycle", "CBT Thought-Feeling-Behavior Cycle", "Family Systems", "Exposure / Behavioral Activation", "DBT Emotion Regulation"],
  "Anxious Attachment": ["Attachment Theory", "Nervous System / Threat Response", "DBT Emotion Regulation", "CBT Thought-Feeling-Behavior Cycle", "Boundaries"],
  "People Pleasing": ["Trauma Responses", "Boundaries", "Family Systems", "DBT Emotion Regulation", "CBT Thought-Feeling-Behavior Cycle"],
  "Perfectionism": ["CBT Thought-Feeling-Behavior Cycle", "Self-Compassion", "Exposure / Behavioral Activation", "Avoidance Cycle"],
  "Burnout": ["Nervous System / Threat Response", "Boundaries", "Family Systems", "Exposure / Behavioral Activation"],
  "High Functioning Anxiety": ["CBT Thought-Feeling-Behavior Cycle", "Nervous System / Threat Response", "Boundaries", "Self-Compassion"],
  "ADHD in Women": ["ADHD Executive Function", "Self-Compassion", "DBT Emotion Regulation", "CBT Thought-Feeling-Behavior Cycle"],
  "Trauma Responses": ["Trauma Responses", "Nervous System / Threat Response", "DBT Emotion Regulation", "Boundaries"],
  "Low Self Esteem": ["Self-Compassion", "CBT Thought-Feeling-Behavior Cycle", "Exposure / Behavioral Activation"],
  "Emotional Avoidance": ["Avoidance Cycle", "DBT Emotion Regulation", "Nervous System / Threat Response", "Trauma Responses"]
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function frameworkByName(name: PsychologyFrameworkName) {
  return frameworks.find((framework) => framework.frameworkName === name);
}

function scoreFramework(framework: PsychologyFramework, topicName: string, angle: string, goal: string) {
  const normalizedAngle = normalize(angle);
  const normalizedGoal = normalize(goal);
  const goalConfig = getContentGoalConfig(goal);
  const preferences = topicFrameworkPreferences[topicName] || [];
  const topicScore = preferences.includes(framework.frameworkName) ? 30 - preferences.indexOf(framework.frameworkName) : 0;
  const angleScore = framework.contentAnglesBestFor.some((bestAngle) => normalize(bestAngle) === normalizedAngle || normalizedAngle.includes(normalize(bestAngle)) || normalize(bestAngle).includes(normalizedAngle)) ? 55 : 0;
  const useScore = framework.whenToUse.some((use) => normalizedAngle.includes(normalize(use)) || normalize(use).includes(normalizedAngle)) ? 20 : 0;
  const goalScore = framework.whenToUse.some((use) => normalizedGoal.includes(normalize(use))) ? 10 : 0;
  const emphasisScore = goalConfig.emphasize.some((term) => `${framework.frameworkName} ${framework.simpleExplanation} ${framework.therapistExplanation}`.toLowerCase().includes(term.toLowerCase())) ? 8 : 0;
  return topicScore + angleScore + useScore + goalScore + emphasisScore;
}

export function getFrameworksForTopic(topic: string) {
  const closestTopic = findClosestTopic(topic);
  if (!closestTopic) return frameworks;
  const preferred = topicFrameworkPreferences[closestTopic.topicName] || [];
  const preferredFrameworks = preferred.map(frameworkByName).filter(Boolean) as PsychologyFramework[];
  const remaining = frameworks.filter((framework) => !preferred.includes(framework.frameworkName));
  return [...preferredFrameworks, ...remaining];
}

export function selectFrameworkForAngle(topic: string, angle: string, goal: string) {
  const closestTopic = findClosestTopic(topic);
  const topicName = closestTopic?.topicName || topic;
  const available = getFrameworksForTopic(topic);
  const scored = available
    .map((framework) => ({ framework, score: scoreFramework(framework, topicName, angle, goal) }))
    .sort((a, b) => b.score - a.score);

  const primary = scored[0]?.framework || frameworks[0];
  const secondary = scored.find((item) => item.framework.frameworkName !== primary.frameworkName && item.score >= 45)?.framework;
  return secondary ? [primary, secondary] : [primary];
}

export function buildFrameworkBrief(topic: string, angle: string, goal: string): FrameworkBrief {
  const selected = selectFrameworkForAngle(topic, angle, goal);
  const selectedFramework = selected.map((framework) => framework.frameworkName).join(" + ");
  const examples = selected.flatMap((framework) => framework.examples).slice(0, 5);
  const avoidNotes = selected.flatMap((framework) => framework.avoidMisuseNotes).slice(0, 4);

  return {
    selectedFramework,
    whyThisFrameworkFits: `${selectedFramework} fits the ${angle} angle because it gives the post a clear clinical teaching path for ${topic} instead of only naming symptoms.`,
    frameworkExplanation: selected.map((framework) => `${framework.frameworkName}: ${framework.therapistExplanation}`).join(" "),
    practicalApplication: `Teach the audience to notice the pattern through ${selectedFramework}, then give one grounded next step. Use examples such as ${examples.join("; ")}. Avoid misuse: ${avoidNotes.join(" ")}`,
    frameworks: selected
  };
}
