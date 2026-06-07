import { findClosestTopic } from "./topicIntelligence";

export type RealLifeExampleProfile = {
  topicName: string;
  childExamples: string[];
  teenExamples: string[];
  adultExamples: string[];
  relationshipExamples: string[];
  schoolExamples: string[];
  workExamples: string[];
  parentingExamples: string[];
  socialMediaExamples: string[];
};

export const REAL_LIFE_EXAMPLE_PROFILES: RealLifeExampleProfile[] = [
  {
    topicName: "Teen Anxiety",
    childExamples: [
      "asking the same question about tomorrow five times before bed",
      "saying their stomach hurts every morning even after the doctor says nothing is medically wrong",
      "crying when a small plan changes because the day suddenly feels unsafe",
      "needing a parent to watch them start homework before they can keep going"
    ],
    teenExamples: [
      "saying I am fine while staring at an unopened assignment for 40 minutes",
      "snapping at a parent after school because they masked anxiety all day",
      "checking grades repeatedly after one missed question",
      "asking to stay home because walking into the cafeteria feels impossible",
      "rewriting a text to a friend until it no longer sounds like them"
    ],
    adultExamples: [
      "remembering how anxiety was called attitude when they were younger",
      "still feeling a body drop when someone says we need to talk",
      "overpreparing for meetings because school performance pressure never fully left",
      "feeling protective when their own child shows the same anxious patterns"
    ],
    relationshipExamples: [
      "needing reassurance after a friend answers with one-word texts",
      "hiding distress to avoid being called dramatic",
      "pulling away from friends because they are afraid of being too much",
      "over-apologizing after a small disagreement"
    ],
    schoolExamples: [
      "feeling sick before a presentation even when they know the material",
      "avoiding a teacher after missing one assignment",
      "freezing during a test because one hard question makes everything feel gone",
      "staying quiet in class to avoid being noticed"
    ],
    workExamples: [
      "a young employee asking for reassurance after every small task",
      "overpreparing for a simple staff meeting because mistakes feel dangerous",
      "calling out before a shift because social pressure feels too intense",
      "checking a schedule repeatedly to avoid missing something"
    ],
    parentingExamples: [
      "a parent asking what is wrong too quickly and watching the teen shut down",
      "mistaking avoidance for laziness when the teen is actually overwhelmed",
      "trying to motivate with pressure and accidentally increasing panic",
      "learning to say I noticed mornings feel harder instead of why are you acting like this"
    ],
    socialMediaExamples: [
      "saving posts about school anxiety but never sending them to a parent",
      "watching study routine videos and feeling worse instead of motivated",
      "reading friendship texts over and over after seeing a vague post",
      "posting like everything is normal while privately feeling sick about school"
    ]
  },
  {
    topicName: "Anxious Attachment",
    childExamples: [
      "asking if a parent is mad after hearing a different tone of voice",
      "following an adult from room to room after a tense moment",
      "needing repeated reassurance before separating at school drop-off",
      "crying when a caregiver is late because the delay feels like danger"
    ],
    teenExamples: [
      "checking if friends are active online after they have not replied",
      "re-reading text messages for signs that someone is pulling away",
      "apologizing for asking whether things are okay",
      "feeling panicked when a best friend makes plans with someone else"
    ],
    adultExamples: [
      "staring at a text message for 20 minutes before responding",
      "feeling calm after reassurance and ashamed five minutes later",
      "drafting a message, deleting it, then checking the phone again",
      "turning a delayed response into a full story about being replaced"
    ],
    relationshipExamples: [
      "feeling a mood shift immediately and trying to fix it before knowing what happened",
      "overexplaining a need so the other person will not feel trapped",
      "testing whether someone cares by pulling away",
      "reading silence as rejection even when there is no evidence"
    ],
    schoolExamples: [
      "assuming a friend is done with them after not sitting together at lunch",
      "replaying hallway interactions to find the exact moment things changed",
      "needing a teacher's approval to feel safe after a mistake",
      "panicking when group plans change without explanation"
    ],
    workExamples: [
      "thinking a manager's short email means they are in trouble",
      "checking Slack status repeatedly after sending a vulnerable message",
      "overexplaining a small mistake before anyone asks",
      "struggling to focus after a coworker seems distant"
    ],
    parentingExamples: [
      "feeling rejected when a teen pulls away developmentally",
      "needing quick repair after conflict because silence feels unbearable",
      "overchecking a child's mood to make sure the relationship is okay",
      "struggling to let a child have space without reading it as abandonment"
    ],
    socialMediaExamples: [
      "watching someone's story and wondering why they still have not texted back",
      "reading too much into a liked post or missing like",
      "checking timestamps for proof of distance",
      "posting something indirect to see if the other person responds"
    ]
  },
  {
    topicName: "People Pleasing",
    childExamples: [
      "saying they like whatever the other child wants so nobody gets upset",
      "cleaning up problems they did not create to avoid disappointment",
      "freezing when asked what they want for dinner",
      "apologizing when an adult is in a bad mood"
    ],
    teenExamples: [
      "agreeing to plans they dread because saying no feels mean",
      "laughing at a joke that hurt because the group is watching",
      "changing an outfit after one friend's comment",
      "becoming the emotional support friend while hiding their own stress"
    ],
    adultExamples: [
      "rewriting a simple no into a paragraph of explanations",
      "answering a request immediately before checking their calendar",
      "feeling guilty for resting when someone else needs help",
      "saying no problem while feeling resentful for days"
    ],
    relationshipExamples: [
      "letting the other person choose every restaurant and calling it easygoing",
      "agreeing during conflict then realizing later they were not honest",
      "monitoring someone's facial expression to decide if they are allowed to relax",
      "staying quiet because disappointment feels like danger"
    ],
    schoolExamples: [
      "doing most of the group project so nobody is mad",
      "letting classmates copy work to stay liked",
      "not telling a teacher they are overwhelmed because they do not want to be difficult",
      "volunteering for too much and then crying at home"
    ],
    workExamples: [
      "taking on one more task because the request came with urgency",
      "checking email after hours so nobody thinks they are unreliable",
      "softening every direct sentence with sorry or just",
      "saying yes in a meeting and immediately feeling trapped"
    ],
    parentingExamples: [
      "letting children avoid all discomfort because their distress feels unbearable",
      "overexplaining a boundary until the child approves of it",
      "saying yes to school requests while already depleted",
      "feeling like a bad parent whenever someone is disappointed"
    ],
    socialMediaExamples: [
      "posting agreeable opinions instead of honest ones",
      "deleting a story because one person might take it wrong",
      "replying to messages instantly to avoid seeming rude",
      "editing captions until they sound harmless but not true"
    ]
  },
  {
    topicName: "Perfectionism",
    childExamples: [
      "crumpling a drawing because one line was not right",
      "refusing to try a new activity unless they know they will be good at it",
      "melting down over a small spelling mistake",
      "asking an adult to check every step before continuing"
    ],
    teenExamples: [
      "rewriting notes until they look perfect instead of studying",
      "avoiding an assignment because the first draft might be bad",
      "crying after a 92 because it was not high enough",
      "not raising a hand unless they are completely sure"
    ],
    adultExamples: [
      "rewriting an email 6 times before sending it",
      "waiting to start until the whole plan feels flawless",
      "calling themselves lazy when they are actually afraid to begin",
      "turning a small correction into a full identity crisis"
    ],
    relationshipExamples: [
      "trying to be the perfect partner instead of an honest one",
      "hiding mistakes so they do not lose respect",
      "getting defensive when feedback touches shame",
      "feeling unlovable when they disappoint someone"
    ],
    schoolExamples: [
      "spending more time formatting a project than writing it",
      "turning in work late because it never feels done",
      "panicking when a teacher says revise",
      "avoiding classes where effort might be visible"
    ],
    workExamples: [
      "missing a deadline because the work was not perfect yet",
      "overpreparing for a routine presentation",
      "checking a spreadsheet repeatedly for invisible errors",
      "feeling unable to rest after positive feedback because one note was critical"
    ],
    parentingExamples: [
      "feeling like one hard parenting day means they are failing",
      "researching every decision until they feel more anxious",
      "trying to create perfect routines and feeling crushed when kids are human",
      "apologizing excessively for small parenting mistakes"
    ],
    socialMediaExamples: [
      "never posting because the feed does not look cohesive enough",
      "deleting a caption after one typo",
      "comparing drafts to professional creators and quitting",
      "saving content ideas but never publishing them"
    ]
  },
  {
    topicName: "Burnout",
    childExamples: [
      "melting down after a full day of trying to behave",
      "crying over a tiny request because the day already used everything",
      "needing silence after school instead of more questions",
      "losing interest in favorite activities because they feel like one more demand"
    ],
    teenExamples: [
      "lying in bed scrolling because starting homework feels impossible",
      "snapping when a parent asks a normal question",
      "feeling numb about activities they used to care about",
      "falling behind because every task feels too heavy"
    ],
    adultExamples: [
      "sitting in the car after errands because going inside means being needed again",
      "feeling irritated by one more notification",
      "forgetting basic tasks because the mental load is full",
      "wanting to disappear for a day without worrying anyone"
    ],
    relationshipExamples: [
      "pulling away from affection because touch feels like another demand",
      "resenting people they love for needing normal things",
      "not texting back because every reply feels like a task",
      "feeling unseen because they are always the one holding everything"
    ],
    schoolExamples: [
      "staring at the laptop while the assignment feels physically impossible",
      "missing deadlines after months of high performance",
      "stopping extracurriculars because there is no recovery time",
      "feeling detached during classes they used to enjoy"
    ],
    workExamples: [
      "opening email and feeling the body sink",
      "making simple mistakes after weeks of overfunctioning",
      "dreading meetings that used to feel manageable",
      "working through lunch because stopping feels risky"
    ],
    parentingExamples: [
      "feeling overstimulated by hearing mom repeatedly",
      "crying in the pantry because everyone needs something",
      "feeling guilty for wanting quiet from people they love",
      "getting angry over a spill because it represents one more thing to handle"
    ],
    socialMediaExamples: [
      "scrolling for an hour and feeling less rested",
      "saving self-care posts while having no room to do them",
      "muting group chats because every message feels like a demand",
      "posting productivity content while privately feeling empty"
    ]
  },
  {
    topicName: "High Functioning Anxiety",
    childExamples: [
      "asking for the schedule repeatedly so nothing surprises them",
      "trying to be the good kid while feeling tense all day",
      "crying when plans change even if the change is small",
      "needing everything packed perfectly before leaving"
    ],
    teenExamples: [
      "being praised for good grades while secretly panicking every night",
      "checking the assignment portal multiple times a day",
      "joining every activity because being impressive feels safer",
      "feeling unable to relax after finishing everything"
    ],
    adultExamples: [
      "checking the calendar three times before bed",
      "turning downtime into another productivity window",
      "feeling tense even after receiving praise",
      "building a backup plan for the backup plan"
    ],
    relationshipExamples: [
      "being the reliable one who never asks for help",
      "feeling resentful when competence becomes expected",
      "struggling to be cared for because needing support feels unsafe",
      "apologizing for being overwhelmed because they are supposed to handle things"
    ],
    schoolExamples: [
      "starting a project early but still feeling behind",
      "asking teachers clarifying questions to avoid any possible mistake",
      "feeling like one missed assignment could ruin everything",
      "overstudying because not knowing one detail feels dangerous"
    ],
    workExamples: [
      "answering emails immediately so nobody questions reliability",
      "overpreparing for a meeting that only needed a quick update",
      "staying late to prevent tomorrow's anxiety",
      "feeling like a fraud after one small correction"
    ],
    parentingExamples: [
      "researching every child decision until the right answer disappears",
      "trying to make the family schedule flawless",
      "feeling guilty when rest means something is unfinished",
      "being praised as organized while privately feeling trapped"
    ],
    socialMediaExamples: [
      "posting polished moments while feeling panicked behind the scenes",
      "saving routines to feel in control",
      "comparing productivity systems and feeling behind",
      "drafting vulnerable posts but deleting them because competence feels safer"
    ]
  },
  {
    topicName: "ADHD in Women",
    childExamples: [
      "losing homework in the backpack even after trying hard",
      "talking too much from excitement and then feeling ashamed",
      "forgetting multi-step directions by the time they reach the other room",
      "being called dramatic when overstimulation turns into tears"
    ],
    teenExamples: [
      "doing the project the night before because urgency finally turns the brain on",
      "forgetting a test date despite caring about the grade",
      "keeping a messy locker that feels impossible to fix",
      "feeling rejected when friends do not respond with the same energy"
    ],
    adultExamples: [
      "buying a planner, filling it out beautifully, then forgetting it exists",
      "remembering the appointment 10 minutes after it started",
      "creating piles because putting things away requires too many invisible steps",
      "feeling exhausted from appearing organized"
    ],
    relationshipExamples: [
      "being accused of not caring because they forgot something important",
      "interrupting from excitement and then replaying it with shame",
      "needing a partner to understand that reminders are support, not control",
      "feeling criticized for symptoms they are already judging"
    ],
    schoolExamples: [
      "knowing the answer but forgetting to turn in the completed assignment",
      "staring at a blank page until the deadline becomes urgent",
      "getting distracted by every sound in the classroom",
      "doing well in classes they love and collapsing in classes that feel boring"
    ],
    workExamples: [
      "missing small admin details while excelling at creative work",
      "opening 14 tabs and forgetting the original task",
      "needing body doubling to start a simple report",
      "feeling unable to prioritize because everything feels equally urgent"
    ],
    parentingExamples: [
      "forgetting school forms and feeling like a terrible parent",
      "being overstimulated by noise while loving their children deeply",
      "creating elaborate family systems that fall apart after a week",
      "needing visual reminders for routines everyone else seems to remember"
    ],
    socialMediaExamples: [
      "saving organization hacks but feeling overwhelmed by all the steps",
      "relating to ADHD reels before understanding why",
      "opening an app to answer one message and losing 30 minutes",
      "drafting a caption then forgetting what they meant to say"
    ]
  },
  {
    topicName: "Trauma Responses",
    childExamples: [
      "going silent when an adult raises their voice",
      "laughing nervously when they are scared",
      "becoming overly helpful when the room feels tense",
      "hiding after making a small mistake"
    ],
    teenExamples: [
      "agreeing with friends to avoid conflict even when uncomfortable",
      "going blank during a hard conversation",
      "snapping when they feel cornered",
      "avoiding places, sounds, or people that remind the body of danger"
    ],
    adultExamples: [
      "knowing they are safe but feeling their body prepare to run",
      "overexplaining to prevent someone from getting angry",
      "feeling numb after a stressful interaction",
      "needing control because unpredictability feels threatening"
    ],
    relationshipExamples: [
      "freezing when a partner asks what is wrong",
      "fawning during conflict and feeling resentful later",
      "mistaking intensity for connection because calm feels unfamiliar",
      "pulling away after closeness because vulnerability feels unsafe"
    ],
    schoolExamples: [
      "shutting down when corrected in front of classmates",
      "being hyperaware of a teacher's tone",
      "asking to leave class when noise feels overwhelming",
      "performing well until conflict makes the body freeze"
    ],
    workExamples: [
      "reading a short message from a manager as danger",
      "feeling unable to speak during performance feedback",
      "working too hard to avoid criticism",
      "feeling exhausted after meetings because the body scanned the whole room"
    ],
    parentingExamples: [
      "reacting strongly to a child's normal defiance because it echoes old danger",
      "apologizing excessively after raising their voice",
      "needing quiet before they can respond safely",
      "feeling shame when a child's big emotions activate their own nervous system"
    ],
    socialMediaExamples: [
      "muting content that sends the body into alarm",
      "posting humor about trauma because direct vulnerability feels unsafe",
      "saving nervous system posts but feeling unsure where to start",
      "reading comments for signs of criticism before posting"
    ]
  },
  {
    topicName: "Low Self Esteem",
    childExamples: [
      "saying their drawing is bad before anyone else can comment",
      "refusing to try because another child is better",
      "hiding work they are proud of because being seen feels scary",
      "asking if someone is mad after normal feedback"
    ],
    teenExamples: [
      "deleting a photo after staring at it too long",
      "not applying for something because rejection feels guaranteed",
      "staying quiet in a group because their idea might sound stupid",
      "assuming friends invited them out of pity"
    ],
    adultExamples: [
      "deflecting a compliment before it can land",
      "not asking for a raise because they already imagine the no",
      "choosing familiar criticism over unfamiliar kindness",
      "apologizing before asking a reasonable question"
    ],
    relationshipExamples: [
      "settling for inconsistent care because it matches their self-story",
      "testing whether someone will leave",
      "feeling suspicious when affection is steady",
      "overgiving to feel worth keeping"
    ],
    schoolExamples: [
      "not turning in good work because it still feels embarrassing",
      "comparing every grade to the highest grade in the class",
      "assuming a teacher's neutral face means disappointment",
      "avoiding clubs where they might be a beginner"
    ],
    workExamples: [
      "not speaking in meetings because the idea might be obvious",
      "over-apologizing for tiny errors",
      "crediting luck when they did good work",
      "feeling exposed after praise from a supervisor"
    ],
    parentingExamples: [
      "feeling like one impatient moment proves they are a bad parent",
      "comparing themselves to every polished parenting post",
      "overexplaining decisions because they do not trust their authority",
      "assuming their child deserves a more confident parent"
    ],
    socialMediaExamples: [
      "deleting a post because it did not get quick engagement",
      "zooming in on every perceived flaw before sharing a photo",
      "comparing their ordinary life to curated content",
      "saving self-worth posts but feeling like they apply to everyone else"
    ]
  },
  {
    topicName: "Emotional Avoidance",
    childExamples: [
      "changing the subject when asked about a hard day",
      "saying they do not care when they are hurt",
      "getting silly when the conversation gets emotional",
      "wanting a screen immediately after a conflict"
    ],
    teenExamples: [
      "saying it is whatever while clearly shutting down",
      "sleeping for hours after emotional stress",
      "using humor so nobody asks follow-up questions",
      "staying constantly busy to avoid being alone with feelings"
    ],
    adultExamples: [
      "cleaning the entire kitchen instead of letting themselves cry",
      "explaining pain like a case study while feeling nothing",
      "opening the phone the second silence feels uncomfortable",
      "saying they are fine because naming the feeling feels too close"
    ],
    relationshipExamples: [
      "offering solutions when a partner wants emotional presence",
      "withdrawing after a vulnerable conversation",
      "becoming irritated when someone asks what they feel",
      "using jokes to leave the emotional room without physically leaving"
    ],
    schoolExamples: [
      "acting unfazed after a friendship rupture",
      "burying themselves in schoolwork after a loss",
      "avoiding the counselor because talking might make it real",
      "saying they do not care about a rejection that clearly hurt"
    ],
    workExamples: [
      "staying late so they do not have to go home and feel",
      "turning grief into productivity",
      "keeping every conversation task-focused",
      "feeling numb in meetings after personal stress"
    ],
    parentingExamples: [
      "jumping into fixing a child's sadness because their own discomfort is loud",
      "struggling to sit with tears without offering solutions",
      "minimizing their own stress so the family does not worry",
      "getting busy after bedtime because quiet brings feelings up"
    ],
    socialMediaExamples: [
      "scrolling the moment a feeling starts to surface",
      "posting jokes about pain instead of naming it",
      "saving therapy posts and never reading them",
      "watching emotional videos late at night but avoiding real conversations"
    ]
  }
];

export function getRelevantExamples(topic: string) {
  const closestTopic = findClosestTopic(topic);
  if (!closestTopic) return null;
  return REAL_LIFE_EXAMPLE_PROFILES.find((profile) => profile.topicName === closestTopic.topicName) || null;
}
