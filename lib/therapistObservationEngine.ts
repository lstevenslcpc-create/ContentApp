import { getContentGoalConfig } from "./contentGoalConfig";
import { findClosestTopic } from "./topicIntelligence";

export type TherapistObservationProfile = {
  topicName: string;
  aliases: string[];
  whatISeeInTherapy: string[];
  commonMisunderstandings: string[];
  hiddenEmotionUnderneathBehavior: string[];
  internalBeliefDrivingBehavior: string[];
  whatOthersUsuallyAssume: string[];
  whatIsActuallyHappeningPsychologically: string[];
  therapistReframes: string[];
  practicalEverydayExamples: string[];
};

export type TherapistObservationBrief = {
  whatISeeInTherapy: string;
  commonMisunderstanding: string;
  hiddenEmotionUnderneathBehavior: string;
  internalBeliefDrivingBehavior: string;
  whatOthersUsuallyAssume: string;
  whatIsActuallyHappeningPsychologically: string;
  therapistReframe: string;
  practicalEverydayExample: string;
  observationLeadIn: string;
};

const profiles: TherapistObservationProfile[] = [
  {
    topicName: "Teen Anxiety",
    aliases: ["teen anxiety", "teen mental health", "school anxiety"],
    whatISeeInTherapy: [
      "What I see in therapy is that teen anxiety often shows up as irritability, avoidance, perfectionism, stomach aches, or shutting down before it ever sounds like worry.",
      "What I see in therapy is a teen who looks fine at school and then collapses emotionally at home because they have been masking all day.",
      "What I see in therapy is that the teen who keeps saying I am fine may not be hiding the truth on purpose. They may not have words for the overwhelm yet."
    ],
    commonMisunderstandings: [
      "Many people assume avoidance means laziness.",
      "Many people assume irritability means disrespect.",
      "Many people assume good grades mean the teen is coping well."
    ],
    hiddenEmotionUnderneathBehavior: [
      "Underneath the behavior is often fear of failing, disappointing someone, or being too much.",
      "Underneath the shutdown is often shame, pressure, or the feeling that one more question will make them lose control.",
      "Underneath the attitude is often a nervous system that has already spent the whole day holding it together."
    ],
    internalBeliefDrivingBehavior: [
      "If I cannot do this perfectly, everyone will see that I am failing.",
      "If I tell them how bad it feels, I will disappoint them or make it worse.",
      "If I avoid it, I can get relief for a minute."
    ],
    whatOthersUsuallyAssume: [
      "Parents may assume the teen is being lazy.",
      "Parents may assume the teen is being dramatic or defiant.",
      "Teachers may assume the teen is unmotivated when the teen is actually overwhelmed."
    ],
    whatIsActuallyHappeningPsychologically: [
      "What is actually happening psychologically is that anxiety is turning normal school or social demands into a threat response.",
      "What is actually happening psychologically is that avoidance gives short-term relief, which can make the anxiety stronger over time.",
      "What is actually happening psychologically is that perfectionism is being used as protection from shame."
    ],
    therapistReframes: [
      "The behavior is information, not the whole identity.",
      "This is not a character problem. It is a capacity and threat-response problem.",
      "The goal is not to force instant openness. The goal is to make the next honest sentence feel safer."
    ],
    practicalEverydayExamples: [
      "A teen says I am fine, then snaps when asked about homework because the task already feels impossible.",
      "A teen asks to stay home because the stomach ache is their anxiety speaking through the body.",
      "A teen procrastinates on an assignment because starting means risking proof that it will not be perfect."
    ]
  },
  {
    topicName: "Anxious Attachment",
    aliases: ["anxious attachment", "relationship anxiety", "attachment anxiety"],
    whatISeeInTherapy: [
      "What I see in therapy is that anxious attachment is often triggered by uncertainty, not by the text message itself.",
      "What I see in therapy is a person who knows logically that silence may mean nothing, while their body reacts like connection is disappearing.",
      "What I see in therapy is that overexplaining is often an attempt to restore emotional safety."
    ],
    commonMisunderstandings: [
      "Many people assume anxious attachment is clinginess.",
      "Many people assume needing reassurance means the person is too needy.",
      "Many people assume the reaction is about drama when it is often about uncertainty."
    ],
    hiddenEmotionUnderneathBehavior: [
      "Underneath the checking is fear of being left.",
      "Underneath the repeated questions is panic that connection has changed.",
      "Underneath the overexplaining is shame and a desperate attempt to get back to safe."
    ],
    internalBeliefDrivingBehavior: [
      "If I do not fix this right now, they may pull away.",
      "A shift in tone means I did something wrong.",
      "I have to earn reassurance before I can calm down."
    ],
    whatOthersUsuallyAssume: [
      "Partners may assume the person is being clingy.",
      "Friends may assume they are overthinking on purpose.",
      "Partners may assume reassurance should make the trigger disappear permanently."
    ],
    whatIsActuallyHappeningPsychologically: [
      "What is actually happening psychologically is that the attachment system is reading ambiguity as possible abandonment.",
      "What is actually happening psychologically is hypervigilance scanning for emotional distance before logic catches up.",
      "What is actually happening psychologically is that the body is responding to a threat cue, even when the relationship is not actually ending."
    ],
    therapistReframes: [
      "The trigger is not proof that you are too much. It is information about where safety feels uncertain.",
      "The goal is not to shame the need for reassurance. The goal is to build steadier communication and self-trust.",
      "A secure response asks for clarity without abandoning yourself."
    ],
    practicalEverydayExamples: [
      "A delayed text turns into rereading the whole conversation for proof that something changed.",
      "A partner's shorter tone makes the body tense before there is any actual conflict.",
      "After a disagreement, the urge to send five clarifying messages is really the urge to feel safe again."
    ]
  },
  {
    topicName: "Perfectionism",
    aliases: ["perfectionism", "fear of failure", "perfectionist anxiety"],
    whatISeeInTherapy: [
      "What I see in therapy is that perfectionism often looks like high standards, but underneath it is fear of mistakes, shame, or being seen as not enough.",
      "What I see in therapy is that procrastination can be perfectionism in disguise.",
      "What I see in therapy is that rest can feel unsafe when someone has learned to earn worth through performance."
    ],
    commonMisunderstandings: [
      "Many people assume perfectionism is just ambition.",
      "Many people assume self-criticism is what keeps them successful.",
      "Many people assume procrastination means laziness."
    ],
    hiddenEmotionUnderneathBehavior: [
      "Underneath the overchecking is fear of being exposed.",
      "Underneath the procrastination is often dread that the first version will not be good enough.",
      "Underneath the achievement is sometimes shame that never feels fully quiet."
    ],
    internalBeliefDrivingBehavior: [
      "If I make a mistake, people will see the real me.",
      "If this is not excellent, it does not count.",
      "I am only safe when I am impressive."
    ],
    whatOthersUsuallyAssume: [
      "Others may assume the person just likes being prepared.",
      "Parents or partners may assume the high achiever is fine because they are successful.",
      "Coworkers may assume the person is controlling when they are actually scared to be responsible for a mistake."
    ],
    whatIsActuallyHappeningPsychologically: [
      "What is actually happening psychologically is that the brain is using control to prevent shame.",
      "What is actually happening psychologically is that mistakes feel like identity threats instead of information.",
      "What is actually happening psychologically is that avoidance gives temporary relief from the possibility of imperfection."
    ],
    therapistReframes: [
      "Perfectionism is not the same as caring. It is caring mixed with fear.",
      "Good enough is not giving up. It is flexibility.",
      "A mistake is information, not an identity."
    ],
    practicalEverydayExamples: [
      "Rewriting an email six times because one sentence might sound wrong.",
      "Waiting until the last minute because starting earlier would mean facing the imperfect first draft.",
      "Feeling unable to rest after success because the next thing already feels like a test."
    ]
  },
  {
    topicName: "People Pleasing",
    aliases: ["people pleasing", "fawn response", "approval seeking"],
    whatISeeInTherapy: [
      "What I see in therapy is that people pleasing is often fear-driven, not kindness-driven.",
      "What I see in therapy is that the person who seems easygoing may have lost access to their own preferences.",
      "What I see in therapy is that resentment often points to a yes that was not fully honest."
    ],
    commonMisunderstandings: [
      "Many people assume people pleasing is just being nice.",
      "Many people assume guilt means a boundary is wrong.",
      "Many people assume keeping the peace means the relationship is healthy."
    ],
    hiddenEmotionUnderneathBehavior: [
      "Underneath the yes is often fear of disappointing someone.",
      "Underneath the constant adapting is fear of being rejected, criticized, or seen as selfish.",
      "Underneath the helpfulness is sometimes anxiety about what will happen if the person has needs."
    ],
    internalBeliefDrivingBehavior: [
      "If someone is upset with me, I am unsafe.",
      "My needs are only acceptable if nobody else is inconvenienced.",
      "I have to be easy to love."
    ],
    whatOthersUsuallyAssume: [
      "Others may assume the person is fine with everything.",
      "Partners may assume silence means agreement.",
      "Family members may assume the person does not have strong needs because they rarely state them."
    ],
    whatIsActuallyHappeningPsychologically: [
      "What is actually happening psychologically is that appeasing reduces anxiety in the short term but can build resentment over time.",
      "What is actually happening psychologically is that the nervous system has learned approval feels safer than honesty.",
      "What is actually happening psychologically is a fawn-style protection response, not a lack of boundaries because the person does not care."
    ],
    therapistReframes: [
      "Kindness without honesty can turn into self-abandonment.",
      "A boundary is not a punishment. It is information about capacity.",
      "Disappointment is uncomfortable, but it is not always danger."
    ],
    practicalEverydayExamples: [
      "Saying yes to plans while already feeling exhausted, then feeling resentful later.",
      "Typing no, deleting it, and sending no worries instead.",
      "Feeling guilty for needing a quiet night because someone else wanted access to you."
    ]
  }
];

const fallbackProfile: TherapistObservationProfile = {
  topicName: "General Mental Health",
  aliases: [],
  whatISeeInTherapy: ["What I see in therapy is that the visible behavior is usually only the surface of a deeper emotional pattern."],
  commonMisunderstandings: ["Many people assume the symptom is the whole story."],
  hiddenEmotionUnderneathBehavior: ["Underneath the behavior is often fear, shame, grief, pressure, or an unmet need."],
  internalBeliefDrivingBehavior: ["If I can manage the outside, maybe I can feel safer inside."],
  whatOthersUsuallyAssume: ["Others may assume the behavior is intentional or simple."],
  whatIsActuallyHappeningPsychologically: ["What is actually happening psychologically is that the nervous system is trying to protect the person with the strategies it knows."],
  therapistReframes: ["The behavior is information. It is not the whole identity."],
  practicalEverydayExamples: ["A small moment on the outside can carry a much bigger emotional meaning inside."]
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

function choose(items: string[], angle: string, goal: string) {
  return [...items]
    .map((item, index) => ({ item, index, score: scoreItem(item, angle, goal) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item || items[0] || "";
}

export function getTherapistObservationProfile(topic: string) {
  const closestTopic = findClosestTopic(topic);
  const normalizedTopic = normalize(topic);
  return profiles.find((profile) => profile.topicName === closestTopic?.topicName)
    || profiles.find((profile) => profile.aliases.some((alias) => normalize(alias) === normalizedTopic || normalizedTopic.includes(normalize(alias))))
    || fallbackProfile;
}

export function buildTherapistObservationBrief(topic: string, angle = "", goal = "education"): TherapistObservationBrief {
  const profile = getTherapistObservationProfile(topic);
  const observation = choose(profile.whatISeeInTherapy, angle, goal);
  return {
    whatISeeInTherapy: observation,
    commonMisunderstanding: choose(profile.commonMisunderstandings, angle, goal),
    hiddenEmotionUnderneathBehavior: choose(profile.hiddenEmotionUnderneathBehavior, angle, goal),
    internalBeliefDrivingBehavior: choose(profile.internalBeliefDrivingBehavior, angle, goal),
    whatOthersUsuallyAssume: choose(profile.whatOthersUsuallyAssume, angle, goal),
    whatIsActuallyHappeningPsychologically: choose(profile.whatIsActuallyHappeningPsychologically, angle, goal),
    therapistReframe: choose(profile.therapistReframes, angle, goal),
    practicalEverydayExample: choose(profile.practicalEverydayExamples, angle, goal),
    observationLeadIn: observation.match(/^(What I see in therapy|Many people assume|What is actually happening|One thing people rarely realize)/i)
      ? observation
      : `What I see in therapy is that ${observation.charAt(0).toLowerCase()}${observation.slice(1)}`
  };
}

export function buildTherapistObservationBriefs(topic: string, angles: string[], goal: string) {
  return angles.map((angle) => buildTherapistObservationBrief(topic, angle, goal));
}
