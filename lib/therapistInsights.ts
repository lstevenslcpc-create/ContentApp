import { findClosestTopic } from "./topicIntelligence";

export type TherapistInsightProfile = {
  topicName: string;
  commonTherapistObservations: string[];
  patternsSeenInPractice: string[];
  commonMisconceptions: string[];
  whatClientsUsuallyBelieve: string[];
  whatTherapistsWishPeopleUnderstood: string[];
};

export const THERAPIST_INSIGHT_PROFILES: TherapistInsightProfile[] = [
  {
    topicName: "Teen Anxiety",
    commonTherapistObservations: [
      "Parents often mistake anxiety for attitude.",
      "Many anxious teens look high functioning at school and fall apart at home where they feel safest.",
      "Teen anxiety often shows up through stomach aches, avoidance, irritability, perfectionism, and shutdown before teens can name worry.",
      "The behavior adults see is often the last step in a much longer internal spiral."
    ],
    patternsSeenInPractice: [
      "A teen avoids the assignment because starting means facing the possibility of not doing it perfectly.",
      "Friendship stress often becomes physical symptoms before school.",
      "Parents ask more questions when they feel worried, and the teen shuts down because the questions feel like pressure.",
      "The teen says I am fine because they do not want to disappoint anyone or make the problem bigger."
    ],
    commonMisconceptions: [
      "Good grades mean the teen is emotionally okay.",
      "Avoidance means laziness.",
      "Irritability means disrespect.",
      "If a teen wanted help, they would ask directly."
    ],
    whatClientsUsuallyBelieve: [
      "I should be able to handle this.",
      "If I tell my parents, they will be disappointed or overreact.",
      "Something is wrong with me because everyone else seems fine.",
      "I have to keep it together so nobody worries."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "Teen anxiety needs curiosity before correction.",
      "A calm observation is usually more helpful than rapid problem-solving.",
      "Anxiety can look like refusal when the teen is actually overwhelmed.",
      "Support works best when parents validate the feeling and help the teen take one tolerable next step."
    ]
  },
  {
    topicName: "Anxious Attachment",
    commonTherapistObservations: [
      "Anxious attachment is often a nervous system alarm, not a character flaw.",
      "The person can know the facts and still feel body panic.",
      "Reassurance often helps briefly, but it does not build long-term safety by itself.",
      "Tone shifts and delayed responses can feel like relational danger before the mind catches up."
    ],
    patternsSeenInPractice: [
      "A delayed text turns into checking, rereading, drafting, deleting, and checking again.",
      "The client apologizes for asking for clarity because having needs feels risky.",
      "The person tracks small changes in warmth and tries to repair something that may not be broken.",
      "They often confuse the body alarm with intuition."
    ],
    commonMisconceptions: [
      "Anxious attachment means someone is needy or dramatic.",
      "More reassurance should fix the anxiety permanently.",
      "If the relationship is healthy, attachment triggers should disappear.",
      "Wanting clarity means the person is too much."
    ],
    whatClientsUsuallyBelieve: [
      "If I ask for reassurance, I will push them away.",
      "Their silence means I did something wrong.",
      "I need to fix this before I can rest.",
      "My needs are the problem."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "The goal is not to stop needing connection. The goal is to respond to the need with more steadiness.",
      "It helps to separate the observation from the story the attachment alarm adds.",
      "Direct communication is often safer than testing or overexplaining.",
      "Secure attachment is built through repeated experiences of clarity, repair, boundaries, and self-trust."
    ]
  },
  {
    topicName: "People Pleasing",
    commonTherapistObservations: [
      "People pleasing is usually fear-driven, not kindness-driven.",
      "Many people pleasers are praised for the exact coping strategy that is draining them.",
      "Resentment often shows where a yes was not fully honest.",
      "The person may know their boundary is reasonable and still feel intense guilt."
    ],
    patternsSeenInPractice: [
      "A client says yes quickly, then spends days feeling trapped or resentful.",
      "They overexplain simple boundaries to manage the other person's reaction.",
      "They monitor facial expressions before deciding if they are allowed to relax.",
      "They confuse disappointing someone with harming them."
    ],
    commonMisconceptions: [
      "People pleasing is just being nice.",
      "A boundary is wrong if someone is upset.",
      "Guilt means the person should change their mind.",
      "Avoiding conflict keeps the relationship healthy."
    ],
    whatClientsUsuallyBelieve: [
      "If they are upset, it is my fault.",
      "Saying no makes me selfish.",
      "I need them to understand before I am allowed to hold the boundary.",
      "It is easier if I just do it."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "Kindness that requires self-abandonment is not sustainable.",
      "Guilt can be a withdrawal symptom from old survival patterns.",
      "Boundaries are allowed to be short.",
      "The work is not becoming less caring. It is becoming more honest."
    ]
  },
  {
    topicName: "Perfectionism",
    commonTherapistObservations: [
      "Perfectionism often protects against shame more than it creates excellence.",
      "Avoidance can be a perfectionism symptom when the standard feels impossible.",
      "Many perfectionists are not trying to be impressive. They are trying to avoid feeling exposed.",
      "Rest can feel unsafe when worth has been tied to performance."
    ],
    patternsSeenInPractice: [
      "A client cannot start because the first draft might be messy.",
      "One small correction becomes evidence that they are failing.",
      "They overprepare to manage uncertainty.",
      "They call fear high standards because high standards sounds more acceptable."
    ],
    commonMisconceptions: [
      "Perfectionism is the same as ambition.",
      "Lowering standards means not caring.",
      "Self-criticism creates better performance.",
      "Procrastination means the person is lazy."
    ],
    whatClientsUsuallyBelieve: [
      "If it is not excellent, it does not count.",
      "A mistake means I am not who people think I am.",
      "I cannot rest until everything is handled.",
      "People respect me because I perform well."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "Flexible standards are not the same as low standards.",
      "Self-compassion supports accountability better than shame.",
      "The first version is supposed to be imperfect.",
      "You can care deeply without treating every task like a threat."
    ]
  },
  {
    topicName: "Burnout",
    commonTherapistObservations: [
      "Burnout is not solved by rest alone when the demand pattern stays the same.",
      "Resentment is often a signal of chronic overextension.",
      "Numbness can be the nervous system conserving energy.",
      "Many burned-out people feel guilty because they still love the people they are exhausted by."
    ],
    patternsSeenInPractice: [
      "A client feels irritated by small requests because the system has no capacity left.",
      "They scroll for relief and feel more depleted afterward.",
      "They fantasize about disappearing because they do not know how to ask for support.",
      "They keep functioning until the body forces a stop."
    ],
    commonMisconceptions: [
      "Burnout means someone is weak.",
      "A vacation fixes burnout.",
      "Irritability means lack of gratitude.",
      "Self-care works if the person just tries harder."
    ],
    whatClientsUsuallyBelieve: [
      "If I stop, everything will fall apart.",
      "I should be grateful, so I should not feel resentful.",
      "Rest is irresponsible when so much is unfinished.",
      "I have nothing left, but I still have to keep going."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "Burnout recovery usually requires load reduction, support, boundaries, and nervous system repair.",
      "Rest must be paired with changes to the conditions that created depletion.",
      "Resentment can be useful information, not a moral failure.",
      "Wanting quiet does not mean you do not love your people."
    ]
  },
  {
    topicName: "High Functioning Anxiety",
    commonTherapistObservations: [
      "High functioning anxiety often gets rewarded, which makes it harder to notice.",
      "Capability does not cancel distress.",
      "The person may look calm because anxiety has taught them to overprepare.",
      "Productivity can become a socially acceptable form of reassurance seeking."
    ],
    patternsSeenInPractice: [
      "A client checks the calendar repeatedly before bed and calls it being responsible.",
      "They cannot enjoy success because the next task already feels urgent.",
      "They are praised as reliable while privately feeling trapped by the role.",
      "They struggle to ask for help because being capable has become part of their identity."
    ],
    commonMisconceptions: [
      "If someone is successful, they are not anxious.",
      "Overpreparing is always healthy.",
      "Restlessness means motivation.",
      "The capable person does not need support."
    ],
    whatClientsUsuallyBelieve: [
      "If I stop, I will fall behind.",
      "People only value me because I am reliable.",
      "I should not be anxious because I am doing well.",
      "One mistake will expose me."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "The goal is not to remove ambition. It is to reduce fear-based overfunctioning.",
      "Rest may need to be practiced like a skill.",
      "Preparedness and anxiety-driven checking are not the same thing.",
      "Support is still valid when the outside looks successful."
    ]
  },
  {
    topicName: "ADHD in Women",
    commonTherapistObservations: [
      "ADHD in women is often hidden by masking, shame, and compensatory perfectionism.",
      "Executive dysfunction is not a moral failure.",
      "Many women grieve the years they spent believing they were lazy.",
      "Emotional dysregulation and rejection sensitivity are often more painful than distractibility."
    ],
    patternsSeenInPractice: [
      "A client buys a planner, uses it intensely, then forgets it exists.",
      "They miss appointments despite caring deeply.",
      "They excel at urgent or interesting work and freeze on simple boring tasks.",
      "They over-apologize for symptoms they are already judging."
    ],
    commonMisconceptions: [
      "ADHD always looks hyperactive.",
      "Good grades rule out ADHD.",
      "Organization problems mean lack of discipline.",
      "Forgetting means not caring."
    ],
    whatClientsUsuallyBelieve: [
      "I should be able to just do the thing.",
      "I am lazy or irresponsible.",
      "If I explain this, people will think I am making excuses.",
      "Everyone else seems to manage normal life better than I do."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "Support should reduce friction, not demand more willpower.",
      "Interest, novelty, urgency, and accountability can shape task initiation.",
      "Late diagnosis can bring both relief and grief.",
      "A person can care deeply and still forget, freeze, or avoid."
    ]
  },
  {
    topicName: "Trauma Responses",
    commonTherapistObservations: [
      "A trauma response is the nervous system trying to protect, not the person trying to be difficult.",
      "The body can respond to reminders, not just current danger.",
      "Fawning can look like kindness while feeling like survival.",
      "Freeze can be mistaken for refusal, laziness, or indifference."
    ],
    patternsSeenInPractice: [
      "A client goes blank during conflict and knows exactly what they wanted to say later.",
      "They become agreeable when they feel scared.",
      "They scan the room and leave exhausted without realizing how much their body was monitoring.",
      "They react strongly to tone because tone once predicted danger."
    ],
    commonMisconceptions: [
      "Trauma responses are choices.",
      "If the person knows they are safe, the body should calm down.",
      "Fawning is just being polite.",
      "Freeze means the person does not care."
    ],
    whatClientsUsuallyBelieve: [
      "I am overreacting.",
      "I should be past this.",
      "My body is betraying me.",
      "If I explain enough, I can prevent danger."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "The first step is often building present-moment safety before analyzing the story.",
      "Understanding the response can reduce shame and create more choice.",
      "Grounding is not a magic fix, but it can help the body locate now.",
      "Trauma work should move at a pace the nervous system can tolerate."
    ]
  },
  {
    topicName: "Low Self Esteem",
    commonTherapistObservations: [
      "Low self-esteem is often a learned relationship with the self, not a permanent truth.",
      "Compliments can feel threatening when criticism feels more familiar.",
      "People with low self-esteem often reject evidence that does not match their self-story.",
      "Overgiving can become a way to feel worth keeping."
    ],
    patternsSeenInPractice: [
      "A client deflects praise before it can land.",
      "They stay in relationships that confirm what they already fear about themselves.",
      "They avoid opportunities because rejection feels like proof.",
      "They apologize before asking reasonable questions."
    ],
    commonMisconceptions: [
      "Low self-esteem is fixed by more compliments.",
      "Confidence must come before action.",
      "Self-compassion means ignoring mistakes.",
      "Someone who overachieves must have high self-esteem."
    ],
    whatClientsUsuallyBelieve: [
      "If people really knew me, they would leave.",
      "I should be further along.",
      "Other people deserve this more than I do.",
      "They are just being nice."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "Neutral self-talk can be more believable than forced positivity.",
      "Self-worth grows through repeated experiences of self-respect, safety, and accurate reflection.",
      "Taking one small action can come before confidence.",
      "You do not have to believe every harsh thought just because it feels familiar."
    ]
  },
  {
    topicName: "Emotional Avoidance",
    commonTherapistObservations: [
      "Emotional avoidance feels helpful short term but often makes feelings louder long term.",
      "Intellectualizing can be a sophisticated way to stay away from pain.",
      "Busy can become a socially approved form of numbing.",
      "People often avoid feelings because they believe feeling them will mean falling apart."
    ],
    patternsSeenInPractice: [
      "A client can explain their pain like a case study but cannot feel the grief underneath.",
      "They clean, work, scroll, or solve the moment quiet brings emotion close.",
      "They become irritated when someone asks what they feel.",
      "They use humor to leave an emotional conversation without leaving the room."
    ],
    commonMisconceptions: [
      "Avoiding feelings means the person is fine.",
      "Talking about feelings will make them worse forever.",
      "Being logical means emotions are handled.",
      "Numbing is the same as regulation."
    ],
    whatClientsUsuallyBelieve: [
      "If I feel it, I will fall apart.",
      "There is no point talking about it.",
      "Other people have it worse.",
      "I just need to move on."
    ],
    whatTherapistsWishPeopleUnderstood: [
      "The goal is tolerating small doses of emotion, not forcing a breakthrough.",
      "Feelings are information and body states, not automatic emergencies.",
      "Solving and feeling are different skills.",
      "Avoidance makes sense, but it should not be the only option available."
    ]
  }
];

export function getTherapistInsights(topic: string) {
  const closestTopic = findClosestTopic(topic);
  if (!closestTopic) return null;
  return THERAPIST_INSIGHT_PROFILES.find((profile) => profile.topicName === closestTopic.topicName) || null;
}
