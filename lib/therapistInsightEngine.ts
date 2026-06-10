import { getContentGoalConfig } from "./contentGoalConfig";
import { findClosestTopic } from "./topicIntelligence";

export type TherapistInsightEngineProfile = {
  topicName: string;
  aliases: string[];
  therapistObservations: string[];
  commonMisunderstandings: string[];
  whatPeopleOftenMiss: string[];
  whatParentsPartnersClientsNeedToKnow: string[];
  whatNotToSay: string[];
  whatToTryInstead: string[];
  clinicalNuance: string[];
  LionHeartStyleNotes: string[];
};

export type TherapistInsightBrief = {
  therapistInsight: string;
  commonMisunderstanding: string;
  whatPeopleOftenMiss: string;
  whatToKnow: string;
  whatNotToSay: string[];
  whatToTryInstead: string[];
  clinicalNuance: string;
  LionHeartStyleNote: string;
};

const profiles: TherapistInsightEngineProfile[] = [
  {
    topicName: "Teen Anxiety",
    aliases: ["teen anxiety", "teen mental health", "school anxiety"],
    therapistObservations: [
      "Anxiety in teens often looks like irritability, avoidance, perfectionism, stomach aches, or shutting down.",
      "Parents may interpret anxiety as attitude when the teen is actually overwhelmed.",
      "Repeatedly asking what is wrong can feel like pressure to a teen who does not have language yet.",
      "A teen who functions at school may still be using every bit of capacity to get through the day."
    ],
    commonMisunderstandings: ["Irritability means disrespect.", "Avoidance means laziness.", "Good grades mean the teen is fine.", "If they needed help, they would ask clearly."],
    whatPeopleOftenMiss: ["The body symptom before school", "The after-school collapse", "The pressure underneath perfectionism", "The shame behind saying I am fine"],
    whatParentsPartnersClientsNeedToKnow: ["Curiosity works better than interrogation.", "The behavior is often communication.", "Calm connection comes before problem-solving.", "The goal is one tolerable next step, not instant openness."],
    whatNotToSay: ["You are being dramatic.", "Just stop worrying.", "There is nothing to be anxious about.", "You need to try harder."],
    whatToTryInstead: ["I am not here to pressure you. I just want you to know I am paying attention.", "Do you want help solving this, or do you just need me to sit with you for a minute?", "I notice mornings have felt harder lately. Want to tell me what part feels biggest?", "We can take this one step at a time."],
    clinicalNuance: ["Validate the anxiety without letting avoidance take over the whole day.", "Name the behavior gently without turning it into shame.", "Parents can reduce pressure while still supporting brave next steps."],
    LionHeartStyleNotes: ["Warm parent coaching, not blame.", "Use concrete teen examples before clinical language.", "Avoid alarmist phrasing.", "Sound like a therapist who understands both the teen and the parent."]
  },
  {
    topicName: "Anxious Attachment",
    aliases: ["anxious attachment", "relationship anxiety", "attachment anxiety"],
    therapistObservations: [
      "The trigger is often uncertainty, not the actual text message.",
      "Silence can feel like danger when connection has felt inconsistent before.",
      "Overexplaining is often an attempt to restore emotional safety.",
      "The body can react to disconnection before logic catches up."
    ],
    commonMisunderstandings: ["Anxious attachment means someone is needy.", "More reassurance should fix it.", "If the relationship is healthy, conflict will not trigger you.", "Wanting clarity is too much."],
    whatPeopleOftenMiss: ["The body panic underneath the text spiral", "The shame after asking for reassurance", "The difference between observation and attachment story", "The need for repair, not control"],
    whatParentsPartnersClientsNeedToKnow: ["Clear communication helps more than guessing games.", "Reassurance can soothe but does not replace self-trust.", "Conflict can feel like abandonment even when no one is leaving.", "Secure repair is direct, kind, and boundaried."],
    whatNotToSay: ["You are too needy.", "You are overreacting.", "Just stop thinking about it.", "If you trusted me, you would not ask."],
    whatToTryInstead: ["Can we clarify what happened instead of guessing?", "My body is reacting to uncertainty. I can slow down before I respond.", "What did I observe, and what story did my attachment alarm add?", "I need reassurance, and I am also practicing tolerating uncertainty."],
    clinicalNuance: ["Do not shame the need for connection.", "Teach the difference between attachment alarm and intuition.", "Support direct repair rather than protest behavior.", "Hold both compassion and accountability."],
    LionHeartStyleNotes: ["Emotionally honest, modern relationship language.", "Name the tiny cue before explaining the framework.", "Avoid making the audience feel broken.", "Use warm clarity over inspirational wording."]
  },
  {
    topicName: "People Pleasing",
    aliases: ["people pleasing", "fawn response", "approval seeking"],
    therapistObservations: ["People pleasing is usually fear-driven, not kindness-driven.", "Guilt after a boundary does not mean the boundary is wrong.", "Resentment often shows where a yes was not honest.", "Many people pleasers were praised for self-abandonment."],
    commonMisunderstandings: ["People pleasing is just being nice.", "Boundaries are mean.", "If someone is disappointed, I did something wrong.", "Keeping the peace is always healthy."],
    whatPeopleOftenMiss: ["The fear underneath the yes", "The resentment after overgiving", "The body tension before saying no", "The loss of preference after years of adapting"],
    whatParentsPartnersClientsNeedToKnow: ["A kind person can still need limits.", "Disappointment is not always danger.", "Short boundaries can be respectful.", "Honesty protects relationships better than silent resentment."],
    whatNotToSay: ["Just say no.", "Stop caring what people think.", "You are too sensitive.", "You let people walk all over you."],
    whatToTryInstead: ["Let me check my capacity before I answer.", "I care about you, and I cannot take that on today.", "I can tolerate their disappointment without abandoning myself.", "A short no is still a full sentence."],
    clinicalNuance: ["Separate generosity from fear-based appeasing.", "Normalize guilt without letting guilt make the decision.", "Teach boundaries as clarity, not punishment."],
    LionHeartStyleNotes: ["Gentle but direct.", "Use language that protects softness without encouraging self-abandonment.", "Avoid bossy empowerment clichés.", "Make the takeaway practical enough to save."]
  },
  {
    topicName: "Perfectionism",
    aliases: ["perfectionism", "fear of failure", "perfectionist anxiety"],
    therapistObservations: ["Perfectionism often protects against shame more than it creates excellence.", "Procrastination can be fear of imperfection.", "Rest can feel unsafe when worth is tied to performance.", "Feedback can feel like exposure, not information."],
    commonMisunderstandings: ["Perfectionism is ambition.", "Self-criticism improves performance.", "Lowering standards means not caring.", "Procrastination means laziness."],
    whatPeopleOftenMiss: ["The shame underneath the standard", "The fear before starting", "The identity threat inside one mistake", "The exhaustion from never feeling done"],
    whatParentsPartnersClientsNeedToKnow: ["Flexible standards are still standards.", "Good enough can be a regulated choice.", "A first draft is allowed to be a draft.", "Mistakes need repair, not identity collapse."],
    whatNotToSay: ["Just lower your standards.", "Stop being so hard on yourself.", "It is not a big deal.", "You are overthinking it."],
    whatToTryInstead: ["What would good enough look like for this task?", "Can this be complete without being perfect?", "A mistake is information, not identity.", "Let the first version be allowed to exist."],
    clinicalNuance: ["Do not shame ambition.", "Target fear-based rigidity, not care or excellence.", "Use self-compassion as accountability support."],
    LionHeartStyleNotes: ["Practical, nuanced, and non-corny.", "Avoid generic affirmation language.", "Use examples like drafts, grades, emails, feedback, and rest guilt."]
  },
  {
    topicName: "Burnout",
    aliases: ["burnout", "emotional exhaustion", "caregiver burnout"],
    therapistObservations: ["Burnout is not fixed by rest if the demand pattern never changes.", "Resentment can be information about chronic overextension.", "Numbness can be the nervous system conserving energy.", "Wanting quiet does not mean someone lacks love."],
    commonMisunderstandings: ["Burnout is laziness.", "A vacation fixes it.", "Irritability means ingratitude.", "Self-care works if you try harder."],
    whatPeopleOftenMiss: ["The invisible labor", "The recovery gap", "The overstimulation from being needed", "The grief of losing access to joy"],
    whatParentsPartnersClientsNeedToKnow: ["Recovery needs load reduction and support.", "Rest has to be protected before collapse.", "Resentment deserves curiosity, not shame.", "Small requests can feel huge when capacity is gone."],
    whatNotToSay: ["Just take a break.", "You should be grateful.", "Everyone is tired.", "Try harder to make time for yourself."],
    whatToTryInstead: ["What can be paused, delegated, delayed, or done at a lower standard?", "I need recovery before I hit empty.", "This resentment is telling me something about the load.", "I love my people and I need quiet."],
    clinicalNuance: ["Do not frame burnout as an individual failure.", "Connect symptoms to conditions and capacity.", "Avoid fluffy self-care language."],
    LionHeartStyleNotes: ["Warm, validating, practical.", "Name invisible labor directly.", "Avoid glamorizing exhaustion.", "Use grounded recovery language."]
  },
  {
    topicName: "High Functioning Anxiety",
    aliases: ["high-functioning anxiety", "high functioning anxiety", "anxious high achiever"],
    therapistObservations: ["High-functioning anxiety can look impressive from the outside while feeling relentless inside.", "Productivity can become a way to manage fear, not just ambition.", "People may confuse competence with emotional ease.", "The collapse often happens in private after the performance is over."],
    commonMisunderstandings: ["If someone is successful, they are not anxious.", "Being busy means they are coping well.", "Reassurance will solve the pressure.", "Achievement proves the system is working."],
    whatPeopleOftenMiss: ["The cost of holding it together", "The fear behind overpreparing", "The private crash after being dependable", "The body tension that gets normalized"],
    whatParentsPartnersClientsNeedToKnow: ["High capacity does not mean unlimited capacity.", "Praise for overfunctioning can accidentally reinforce anxiety.", "Rest may feel emotionally unsafe.", "Support should include permission to be human, not only more performance."],
    whatNotToSay: ["But you are doing so well.", "Everyone gets stressed.", "You just need better time management.", "At least you are successful."],
    whatToTryInstead: ["You can be capable and still need support.", "What pressure are you carrying that nobody sees?", "What would enough look like today?", "Your worth does not have to be proven by staying overwhelmed."],
    clinicalNuance: ["Do not pathologize ambition.", "Focus on fear-based overfunctioning and recovery capacity.", "Teach self-trust without shaming achievement."],
    LionHeartStyleNotes: ["Respect the audience's competence while naming the hidden cost.", "Use precise examples like rereading emails, overpreparing, and crashing after social or work demands.", "Avoid hustle-culture language."]
  },
  {
    topicName: "Emotional Shutdown",
    aliases: ["emotional shutdown", "shutdown", "numbing", "freeze response"],
    therapistObservations: ["Shutdown is often protection, not indifference.", "When the system feels overloaded, words can disappear before care disappears.", "People may look calm while internally feeling unreachable.", "Pressure to explain can deepen the shutdown."],
    commonMisunderstandings: ["Shutdown means someone does not care.", "They are giving the silent treatment on purpose.", "If they loved you, they would talk right away.", "More questions will get clarity faster."],
    whatPeopleOftenMiss: ["The overload before silence", "The shame after not being able to respond", "The body heaviness that blocks language", "The need for safety before processing"],
    whatParentsPartnersClientsNeedToKnow: ["Space with connection is different from abandonment.", "Gentle structure can help words return.", "Repair can happen after the nervous system settles.", "A calmer entry point usually works better than interrogation."],
    whatNotToSay: ["Why are you ignoring me?", "Use your words right now.", "You are being cold.", "You always shut down."],
    whatToTryInstead: ["I can see this is too much right now. We can come back to it.", "I care about repair, and I can give you a minute.", "Would it help to text this instead of saying it out loud?", "Let us start with one sentence, not the whole story."],
    clinicalNuance: ["Differentiate shutdown from intentional punishment.", "Support accountability after regulation returns.", "Do not make silence the enemy. Make safety and repair the goal."],
    LionHeartStyleNotes: ["Soft, non-blaming, and precise.", "Use nervous system language in plain English.", "Name the relational impact without shaming the person shutting down."]
  },
  {
    topicName: "Conflict Avoidance",
    aliases: ["conflict avoidance", "avoiding conflict", "fear of conflict"],
    therapistObservations: ["Conflict avoidance often starts as safety-seeking.", "Peacekeeping can become self-erasure when honesty feels dangerous.", "Avoiding the conversation may reduce anxiety short term and increase resentment long term.", "Some people learned that disagreement meant disconnection."],
    commonMisunderstandings: ["Avoiding conflict means being easygoing.", "Disagreement is disrespect.", "If someone is upset, the relationship is unsafe.", "Silence keeps the peace."],
    whatPeopleOftenMiss: ["The fear of losing connection", "The resentment after staying quiet", "The body alarm before speaking honestly", "The difference between calm honesty and attack"],
    whatParentsPartnersClientsNeedToKnow: ["Repair can make relationships safer than avoidance does.", "A boundary can be kind and still firm.", "Small honest statements build capacity for bigger conversations.", "Tone matters, but truth still matters."],
    whatNotToSay: ["Just confront them.", "Stop being a pushover.", "You are making it a bigger deal.", "Conflict is no big deal."],
    whatToTryInstead: ["I want to be honest without being hurtful.", "I need a minute to say this clearly.", "This matters to me, and I want us to talk about it.", "I can handle discomfort without disappearing."],
    clinicalNuance: ["Do not push directness without assessing safety.", "Teach regulated communication, not forced confrontation.", "Separate conflict from emotional threat."],
    LionHeartStyleNotes: ["Use scripts people can copy.", "Keep the tone brave but gentle.", "Avoid aggressive boundary language."]
  },
  {
    topicName: "Trauma Responses",
    aliases: ["trauma responses", "fight flight freeze fawn", "trauma response"],
    therapistObservations: ["Trauma responses are survival adaptations, not personality flaws.", "A reaction can be disproportionate to the moment and still make sense in context.", "Fawn responses are often mistaken for kindness.", "The body may respond to reminders before the mind understands why."],
    commonMisunderstandings: ["Trauma responses are excuses.", "If it happened long ago, it should not affect now.", "Calm means healed.", "A person can simply choose not to react."],
    whatPeopleOftenMiss: ["The trigger underneath the reaction", "The survival logic behind people pleasing or shutdown", "The shame after the nervous system takes over", "The difference between explanation and excuse"],
    whatParentsPartnersClientsNeedToKnow: ["Safety cues matter.", "Accountability works best with nervous system awareness.", "Trauma healing is not linear or performative.", "Support should avoid graphic details and overexposure online."],
    whatNotToSay: ["That was in the past.", "You are overreacting.", "Why can you not just move on?", "Everyone has trauma."],
    whatToTryInstead: ["My body is reacting like this is happening again.", "What safety cue do I need right now?", "This reaction has a history, and I can still choose my next step.", "I can slow down before I respond."],
    clinicalNuance: ["Avoid graphic storytelling.", "Avoid diagnosing strangers from short content.", "Balance validation with agency and safety."],
    LionHeartStyleNotes: ["Trauma-informed without being sensational.", "Use grounded body-based language.", "Prioritize safety, dignity, and practical regulation."]
  },
  {
    topicName: "Depression in Teens",
    aliases: ["depression in teens", "teen depression", "functional depression", "masked depression"],
    therapistObservations: ["Teen depression can look like irritability, withdrawal, low motivation, sleep changes, or saying I do not care.", "Some teens mask all day and collapse at home.", "Loss of interest can be quieter than obvious sadness.", "Parents may see defiance when the teen is moving through heaviness."],
    commonMisunderstandings: ["Depression always looks like crying.", "If they laugh with friends, they are fine.", "Low motivation is laziness.", "Taking the phone away fixes the problem."],
    whatPeopleOftenMiss: ["The effort behind basic tasks", "The shame of not knowing how to explain numbness", "The social masking", "The difference between attitude and emotional heaviness"],
    whatParentsPartnersClientsNeedToKnow: ["Ask about safety directly and calmly when concerned.", "Small routines can support, but depression needs compassion and care.", "Connection before correction matters.", "Professional support is important when symptoms persist or safety is a concern."],
    whatNotToSay: ["You have nothing to be depressed about.", "Just be positive.", "You are being lazy.", "Other people have it worse."],
    whatToTryInstead: ["I am glad you told me. You do not have to explain it perfectly.", "I am going to stay close and help you get support.", "What feels hardest to do today?", "We can start with one small thing and keep checking in."],
    clinicalNuance: ["Include safety language without fear-baiting.", "Avoid treating social media content as diagnosis.", "Encourage support and crisis resources when risk is present."],
    LionHeartStyleNotes: ["Calm, direct, and compassionate.", "Speak to parents without blame.", "Use concrete signs like withdrawal, sleep, irritability, and loss of interest."]
  }
];

const fallbackProfile: TherapistInsightEngineProfile = {
  topicName: "General Mental Health",
  aliases: [],
  therapistObservations: ["The visible behavior is often only part of the emotional pattern.", "People need language before they can make different choices."],
  commonMisunderstandings: ["The symptom is the whole story.", "A quick mindset shift is enough."],
  whatPeopleOftenMiss: ["The body cue", "The relationship context", "The learned coping strategy"],
  whatParentsPartnersClientsNeedToKnow: ["Curiosity reduces shame.", "Practical next steps work better when the person feels understood."],
  whatNotToSay: ["Just stop thinking about it.", "You are overreacting.", "It is not a big deal."],
  whatToTryInstead: ["What is this reaction trying to protect?", "What would one small, supported next step look like?"],
  clinicalNuance: ["Avoid diagnosing from a post.", "Use specificity without overpromising."],
  LionHeartStyleNotes: ["Therapist-led, emotionally specific, practical, warm, and non-generic."]
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreItem(item: string, angle: string, goal: string) {
  const normalized = normalize(item);
  const angleWords = normalize(angle).split(" ").filter((word) => word.length > 2);
  const goalConfig = getContentGoalConfig(goal);
  return angleWords.reduce((score, word) => score + (normalized.includes(word) ? 8 : 0), 0)
    + goalConfig.emphasize.reduce((score, term) => score + (normalized.includes(normalize(term)) ? 4 : 0), 0);
}

function choose(items: string[], angle: string, goal: string, count = 1) {
  return [...items]
    .map((item, index) => ({ item, index, score: scoreItem(item, angle, goal) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .map((entry) => entry.item);
}

export function getTherapistInsights(topic: string) {
  const closestTopic = findClosestTopic(topic);
  const normalizedTopic = normalize(topic);
  return profiles.find((profile) => profile.topicName === closestTopic?.topicName)
    || profiles.find((profile) => profile.aliases.some((alias) => normalize(alias) === normalizedTopic))
    || fallbackProfile;
}

export function selectTherapistInsight(topic: string, angle: string, goal: string) {
  const profile = getTherapistInsights(topic);
  return {
    therapistInsight: choose(profile.therapistObservations, angle, goal)[0],
    commonMisunderstanding: choose(profile.commonMisunderstandings, angle, goal)[0],
    whatPeopleOftenMiss: choose(profile.whatPeopleOftenMiss, angle, goal)[0],
    whatToKnow: choose(profile.whatParentsPartnersClientsNeedToKnow, angle, goal)[0],
    whatNotToSay: choose(profile.whatNotToSay, angle, goal, 2),
    whatToTryInstead: choose(profile.whatToTryInstead, angle, goal, 2),
    clinicalNuance: choose(profile.clinicalNuance, angle, goal)[0],
    LionHeartStyleNote: choose(profile.LionHeartStyleNotes, angle, goal)[0]
  };
}

export function buildTherapistInsightBrief(topic: string, angle: string, goal: string): TherapistInsightBrief {
  return selectTherapistInsight(topic, angle, goal);
}
