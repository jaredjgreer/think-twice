#!/usr/bin/env python3
"""Add 60 new cognitive biases to the game data."""
import json
import sys

with open('data/cognitive-biases.json') as f:
    d = json.load(f)

existing_ids = {c['id'] for c in d['cards']}
print(f"Starting with {len(d['cards'])} cards")

new_cards = [
  {
    "id": "hindsight",
    "name": "Hindsight Bias",
    "tiers": {
      "1": {
        "definition": "When something happens and you say 'I knew it all along!' even though you didn't really know.",
        "scenarioDoneTo": "Your team loses the game and your friend says 'I KNEW they were going to lose!' But before the game they were cheering and saying they'd win.",
        "scenarioYouDo": "A kid in class gets in trouble and you tell everyone 'I always knew they were a troublemaker' — but you never actually said that before.",
        "challenge": {
          "scenario": "After a surprise quiz, almost every student claims they 'had a feeling' there would be one today, even though nobody studied.",
          "options": ["Hindsight Bias", "Optimism Bias", "Confirmation Bias"],
          "correct": 0
        },
        "tip": "Before something happens, write down what you think will happen. Then check later — you'll be surprised how often you were wrong!"
      },
      "2": {
        "definition": "The tendency to believe, after an event has occurred, that you would have predicted or expected the outcome beforehand.",
        "scenarioDoneTo": "After a company goes bankrupt, financial analysts say the warning signs were 'obvious' — but none of them warned anyone before it happened.",
        "scenarioYouDo": "After your friend's relationship ends, you tell them 'I saw that coming from a mile away' even though you never mentioned any concerns.",
        "challenge": {
          "scenario": "After an election result surprises everyone, pundits claim the outcome was 'inevitable' and point to signs that were there all along.",
          "options": ["Bandwagon Effect", "Confirmation Bias", "Hindsight Bias", "Authority Bias"],
          "correct": 2
        },
        "tip": "Keep a prediction journal. Write down what you think will happen before events unfold — it's humbling and helps you see this bias clearly."
      },
      "3": {
        "definition": "The 'I-knew-it-all-along' effect — after learning an outcome, your brain retroactively inserts that knowledge into your memory, making you believe you predicted it when you didn't.",
        "scenarioDoneTo": "Medical malpractice juries tend to judge doctors harshly because the bad outcome seems 'obvious' in hindsight, even though the symptoms were genuinely ambiguous at the time of treatment.",
        "scenarioYouDo": "After a project fails, you reconstruct your memory to believe you had reservations all along. You even 'remember' voicing concerns — but meeting notes show you were fully supportive.",
        "challenge": {
          "scenario": "Studies show that people given the outcome of historical events rate those outcomes as significantly more predictable than people who haven't been told what happened.",
          "options": ["Hindsight Bias", "Anchoring Bias", "Choice-Supportive Bias", "Availability Heuristic"],
          "correct": 0
        },
        "tip": "Practice intellectual humility. Document your reasoning at the time decisions are made so you can honestly evaluate your judgment later, rather than letting outcomes rewrite your memory."
      }
    }
  },
  {
    "id": "self-serving",
    "name": "Self-Serving Bias",
    "tiers": {
      "1": {
        "definition": "When you take credit for good things but blame other stuff when things go wrong.",
        "scenarioDoneTo": "Your group wins a science fair project and one kid says 'It was all my idea!' — but when you lost last year, the same kid said 'Nobody else helped enough.'",
        "scenarioYouDo": "You get an A on a test and say 'I'm so smart!' But when you get a bad grade, you say 'The teacher made a bad test.'",
        "challenge": {
          "scenario": "A kid scores the winning goal and tells everyone how hard they practiced. But when they miss an easy shot next game, they blame the muddy field.",
          "options": ["Self-Serving Bias", "Dunning-Kruger Effect", "Optimism Bias"],
          "correct": 0
        },
        "tip": "When something goes well, think about who helped you. When something goes badly, think about what YOU could have done differently."
      },
      "2": {
        "definition": "The tendency to attribute your successes to your own abilities and efforts, while blaming failures on external factors or other people.",
        "scenarioDoneTo": "Your coworker keeps taking credit for the team's wins in meetings but always has an excuse when things go wrong — the timeline was too tight, the client changed requirements, etc.",
        "scenarioYouDo": "When your presentation goes well, you think it's because of your talent. When it bombs, you blame the audience for not paying attention or the projector for malfunctioning.",
        "challenge": {
          "scenario": "Students who receive good grades attribute them to intelligence and effort. The same students attribute bad grades to unfair tests or bad teaching.",
          "options": ["Fundamental Attribution Error", "Self-Serving Bias", "Dunning-Kruger Effect", "Choice-Supportive Bias"],
          "correct": 1
        },
        "tip": "Apply the same standard to wins and losses. If you credit your skill for a win, be honest about your role in a loss too."
      },
      "3": {
        "definition": "A cognitive bias where individuals attribute positive outcomes to their own character or actions and negative outcomes to external factors — protecting self-esteem at the cost of accurate self-assessment.",
        "scenarioDoneTo": "CEOs of companies that succeed credit their 'vision and leadership,' while CEOs of companies that fail cite market conditions, regulatory changes, or bad luck — research shows the pattern is nearly universal.",
        "scenarioYouDo": "As a manager, you present the team's quarterly success as a result of your strategic direction. When next quarter underperforms, your report blames supply chain issues and market headwinds with no mention of leadership decisions.",
        "challenge": {
          "scenario": "A meta-analysis of attribution studies found that across cultures, people consistently take more personal credit for success than failure — even when outcomes are determined by pure chance, like coin flips.",
          "options": ["Self-Serving Bias", "Fundamental Attribution Error", "Dunning-Kruger Effect", "Optimism Bias"],
          "correct": 0
        },
        "tip": "After any outcome, force yourself to identify at least one internal factor for failures and one external factor for successes. This creates a more balanced and accurate self-narrative."
      }
    }
  },
  {
    "id": "fundamental-attribution",
    "name": "Fundamental Attribution Error",
    "tiers": {
      "1": {
        "definition": "When you think someone did something because of who they are, instead of thinking about what situation they were in.",
        "scenarioDoneTo": "A kid bumps into you in the hallway and you think 'They're so rude!' — but actually they got pushed by someone behind them.",
        "scenarioYouDo": "You see someone eating lunch alone and think 'They must be weird.' But actually their friends are all out sick today.",
        "challenge": {
          "scenario": "Someone cuts in front of you in line. You immediately think 'What a jerk!' It turns out they're rushing because their little sister is lost.",
          "options": ["Negativity Bias", "Fundamental Attribution Error", "In-Group Bias"],
          "correct": 1
        },
        "tip": "When someone does something that bothers you, try to think of three reasons WHY they might have done it that have nothing to do with them being a bad person."
      },
      "2": {
        "definition": "The tendency to overemphasize personality-based explanations for other people's behavior while underemphasizing situational factors.",
        "scenarioDoneTo": "When someone at work snaps at you, you label them as 'rude' — but when you snap at someone because you're stressed, you explain it away as a tough day.",
        "scenarioYouDo": "You see a coworker leaving early and assume they're lazy. You don't consider they might have a sick child, a medical appointment, or worked through the weekend.",
        "challenge": {
          "scenario": "Viewers of a debate judged speakers as genuinely agreeing with their assigned positions, even when told the speakers were randomly assigned which side to argue.",
          "options": ["Confirmation Bias", "Authority Bias", "Fundamental Attribution Error", "Halo Effect"],
          "correct": 2
        },
        "tip": "Before judging someone's character, ask: 'What situation might lead a reasonable person to act this way?' You'd want the same consideration."
      },
      "3": {
        "definition": "The systematic tendency to overweight dispositional (personality-based) factors and underweight situational factors when explaining others' behavior — while doing the opposite for your own behavior.",
        "scenarioDoneTo": "In a famous study, participants read essays written under assignment (no choice of position). Despite knowing this, readers still assumed the writers genuinely held the views they were told to argue.",
        "scenarioYouDo": "You evaluate an employee's missed deadline as a sign of poor work ethic, ignoring that they were simultaneously handling three emergency projects and a staffing shortage — context you'd cite immediately if it were your own deadline.",
        "challenge": {
          "scenario": "Cross-cultural research shows this bias is significantly stronger in individualistic Western cultures than in collectivist Eastern cultures, suggesting it's partly learned rather than purely innate.",
          "options": ["In-Group Bias", "Fundamental Attribution Error", "Authority Bias", "Status Quo Bias"],
          "correct": 1
        },
        "tip": "Practice the 'actor-observer' swap: explain someone else's behavior as if it were your own (focusing on situation) and your own behavior as if watching someone else (focusing on character). The gap reveals the bias."
      }
    }
  },
  {
    "id": "mere-exposure",
    "name": "Mere Exposure Effect",
    "tiers": {
      "1": {
        "definition": "When you like something more just because you've seen it a lot, not because it's actually better.",
        "scenarioDoneTo": "A song comes on the radio that you hated at first. But after hearing it 20 times, you catch yourself humming it and kind of liking it.",
        "scenarioYouDo": "You always pick the same seat in class. One day someone else sits there and you feel annoyed — not because it's a better seat, but just because you're used to it.",
        "challenge": {
          "scenario": "A kid says their favorite cereal is the best one ever. It's also the only cereal their parents have ever bought.",
          "options": ["Mere Exposure Effect", "Status Quo Bias", "Choice-Supportive Bias"],
          "correct": 0
        },
        "tip": "Try something new on purpose — a different food, song, or route to school. You might like it if you give it the same number of chances."
      },
      "2": {
        "definition": "The psychological phenomenon where people develop a preference for things simply because they are familiar with them, regardless of quality.",
        "scenarioDoneTo": "Advertisers show you the same brand logo thousands of times. When you're at the store choosing between products, you instinctively reach for the one that 'feels right' — it's just the one you've seen most.",
        "scenarioYouDo": "You recommend a restaurant as the 'best in town' when really it's just the one you've been to most. You've never actually tried the others.",
        "challenge": {
          "scenario": "In studies, people shown Chinese characters more frequently rated those characters as having more positive meanings — despite not reading Chinese at all.",
          "options": ["Halo Effect", "Mere Exposure Effect", "Anchoring Bias", "Bandwagon Effect"],
          "correct": 1
        },
        "tip": "When you notice a strong preference, ask yourself: 'Do I actually think this is best, or have I just spent the most time with it?'"
      },
      "3": {
        "definition": "Repeated exposure to a stimulus increases liking for it, independent of conscious recognition — a powerful effect exploited by advertising and one that shapes personal preferences more than most people realize.",
        "scenarioDoneTo": "Subliminal exposure studies show that people prefer stimuli they've been exposed to even when they have zero conscious memory of seeing them — the effect operates below the level of awareness.",
        "scenarioYouDo": "You advocate for a particular software tool at work, believing it's objectively superior. In reality, it's the first tool you learned, and you've never seriously evaluated alternatives — your comfort masquerades as informed preference.",
        "challenge": {
          "scenario": "Political candidates with more yard signs and TV appearances gain polling points even among voters who say they are uninfluenced by advertising and rely solely on policy positions.",
          "options": ["Mere Exposure Effect", "Bandwagon Effect", "Authority Bias", "Halo Effect"],
          "correct": 0
        },
        "tip": "Implement structured comparison processes that put unfamiliar options on equal footing with familiar ones. Familiarity feels like quality — so create blind evaluations where you can't tell which option is the one you've seen before."
      }
    }
  },
  {
    "id": "impostor-syndrome",
    "name": "Impostor Syndrome",
    "tiers": {
      "1": {
        "definition": "When you're actually good at something but you feel like you're faking it and everyone will find out.",
        "scenarioDoneTo": "Your friend won first place in the art contest but keeps saying 'I just got lucky, my art isn't really that good' even though everyone loves it.",
        "scenarioYouDo": "You get picked for the school play and immediately think 'They made a mistake, I can't really act' — even though you nailed the audition.",
        "challenge": {
          "scenario": "A student who gets straight A's feels like a fraud and thinks everyone else is actually smarter. They study extra hard out of fear of being 'found out.'",
          "options": ["Impostor Syndrome", "Negativity Bias", "Spotlight Effect"],
          "correct": 0
        },
        "tip": "Keep a list of things you've done well. When you feel like a fake, read the list. The proof that you're good is in what you've already done."
      },
      "2": {
        "definition": "A pattern where competent individuals doubt their abilities and fear being exposed as a 'fraud,' despite evidence of their accomplishments.",
        "scenarioDoneTo": "Your brain convinces you that your achievements are due to luck, timing, or fooling people — not because you're actually skilled.",
        "scenarioYouDo": "You got promoted at work but you spend weeks certain they'll 'realize the mistake.' You downplay your skills in meetings and over-prepare for everything out of anxiety.",
        "challenge": {
          "scenario": "A study found that 70% of people experience impostor feelings at some point. High-achieving women and minority professionals report even higher rates despite strong track records.",
          "options": ["Spotlight Effect", "Dunning-Kruger Effect", "Impostor Syndrome", "Self-Serving Bias"],
          "correct": 2
        },
        "tip": "Share your feelings with trusted peers — you'll be surprised how many high achievers feel the same way. External validation can break the cycle."
      },
      "3": {
        "definition": "A psychological pattern in which a person doubts their skills, talents, or accomplishments and has a persistent internalized fear of being exposed as a fraud — often despite overwhelming external evidence of competence.",
        "scenarioDoneTo": "Nobel Prize winners, best-selling authors, and Fortune 500 CEOs have publicly admitted to impostor feelings — demonstrating that no level of external success can fully silence the internal doubt.",
        "scenarioYouDo": "You've been the lead engineer for five successful products but still prep for meetings as if you're a junior hire. You attribute each success to the team, lucky timing, or low difficulty — never your own expertise.",
        "challenge": {
          "scenario": "Research shows that impostor syndrome often intensifies with success — the more you achieve, the more you feel you have to 'live up to,' creating a paradox where growth feeds self-doubt.",
          "options": ["Impostor Syndrome", "Negativity Bias", "Dunning-Kruger Effect", "Spotlight Effect"],
          "correct": 0
        },
        "tip": "Reframe: feeling like a fraud often means you're in a growth zone. Keep an 'evidence file' of wins and positive feedback. When doubt strikes, let the evidence speak — not your anxiety."
      }
    }
  },
  {
    "id": "planning-fallacy",
    "name": "Planning Fallacy",
    "tiers": {
      "1": {
        "definition": "When you think something will take way less time than it actually does.",
        "scenarioDoneTo": "Your parent says 'We'll leave in 5 minutes' and you're still waiting 30 minutes later.",
        "scenarioYouDo": "You tell your teacher you'll finish your project tonight. It's a 3-week project and there's 2 days left. You end up staying up way too late and it's still not great.",
        "challenge": {
          "scenario": "A kid says they can clean their whole room in 10 minutes. An hour later, they've only cleaned half.",
          "options": ["Optimism Bias", "Planning Fallacy", "Dunning-Kruger Effect"],
          "correct": 1
        },
        "tip": "Think about how long similar things took you LAST time. That's usually a much better guess than how long you THINK it will take."
      },
      "2": {
        "definition": "The tendency to underestimate the time, costs, and risks of future actions while overestimating their benefits — even when you have past experience showing otherwise.",
        "scenarioDoneTo": "Your city says the new train station will be done in 2 years for $50 million. It actually takes 5 years and costs $120 million. This happens with almost every major public project.",
        "scenarioYouDo": "You promise a client the report by Friday, genuinely believing you can do it. You've never once finished a report that fast, but this time feels different (it isn't).",
        "challenge": {
          "scenario": "Students estimated their thesis completion dates. On average, they finished 21 days later than their 'realistic' estimate and 7 days later than their 'worst case' estimate.",
          "options": ["Optimism Bias", "Dunning-Kruger Effect", "Planning Fallacy", "Anchoring Bias"],
          "correct": 2
        },
        "tip": "Use 'reference class forecasting' — look at how long similar tasks took in the past, not how long this one feels like it should take."
      },
      "3": {
        "definition": "A cognitive bias in which predictions about how much time will be needed to complete a future task display an optimistic bias and underestimate the time needed — even when the person has extensive experience with similar tasks running over schedule.",
        "scenarioDoneTo": "The Sydney Opera House was estimated to take 4 years and cost $7M. It took 16 years and cost $102M. Similar patterns plague virtually every major construction, software, and government project.",
        "scenarioYouDo": "Your team's sprint planning consistently underestimates story points by 40%. Despite reviewing this data at every retrospective, each new sprint plan displays the same optimism — you plan for ideal conditions rather than realistic ones.",
        "challenge": {
          "scenario": "Kahneman and Tversky found that people make plans based on 'inside view' (this specific task) while ignoring 'outside view' (base rates of similar tasks). Even making people aware of the bias barely reduces it.",
          "options": ["Planning Fallacy", "Optimism Bias", "Dunning-Kruger Effect", "Anchoring Bias"],
          "correct": 0
        },
        "tip": "Adopt the 'outside view' systematically: build estimates from historical data of comparable projects, not from bottom-up task analysis which consistently produces optimistic timelines."
      }
    }
  },
  {
    "id": "false-consensus",
    "name": "False Consensus Effect",
    "tiers": {
      "1": {
        "definition": "When you think most people agree with you, even when they don't.",
        "scenarioDoneTo": "Your friend says 'Everyone thinks pineapple on pizza is gross!' But actually, lots of people like it — your friend just assumed everyone agrees with them.",
        "scenarioYouDo": "You hate a popular TV show and say 'Nobody actually likes this, they're all pretending.' But millions of people genuinely enjoy it — you just can't believe they disagree with you.",
        "challenge": {
          "scenario": "A kid refuses to try sushi and says 'All kids hate sushi.' But half the class actually loves it.",
          "options": ["Bandwagon Effect", "False Consensus Effect", "Confirmation Bias"],
          "correct": 1
        },
        "tip": "Instead of saying 'everyone thinks...' try asking people what they actually think. You might be surprised!"
      },
      "2": {
        "definition": "The tendency to overestimate the degree to which other people share your beliefs, values, and behaviors.",
        "scenarioDoneTo": "Social media algorithms surround you with like-minded people, reinforcing the feeling that 'everyone' agrees with your views — until you encounter the real world and discover significant disagreement.",
        "scenarioYouDo": "You assume most of your coworkers share your political views because the topic rarely comes up. Actually, they stay quiet because they disagree but don't want conflict.",
        "challenge": {
          "scenario": "In a classic study, students were asked to walk around campus wearing a sandwich board. Those who agreed assumed most others would too. Those who refused assumed most others would refuse.",
          "options": ["Bandwagon Effect", "In-Group Bias", "False Consensus Effect", "Spotlight Effect"],
          "correct": 2
        },
        "tip": "Seek out diverse viewpoints deliberately. When you catch yourself saying 'most people think...', pause and consider whether you're projecting your own views."
      },
      "3": {
        "definition": "The cognitive bias where individuals overestimate the extent to which their opinions, beliefs, preferences, and values are shared by others — creating a false sense that a 'consensus' exists around one's own position.",
        "scenarioDoneTo": "Echo chambers in media and social networks amplify this bias by making minority positions appear mainstream within bubbles, leading to genuine shock when election results or market behaviors don't match expectations.",
        "scenarioYouDo": "As a product manager, you assume customers want the features you personally value. You skip user research because the need seems 'obvious,' then are blindsided when the feature launches to indifference.",
        "challenge": {
          "scenario": "Research shows that people who engage in a behavior (e.g., texting while driving) estimate that a much higher percentage of the population does the same — using their own behavior to anchor their estimate of 'normal.'",
          "options": ["False Consensus Effect", "Self-Serving Bias", "Anchoring Bias", "Availability Heuristic"],
          "correct": 0
        },
        "tip": "Replace assumption with data. Before acting on what you believe 'most people' think, run surveys, examine research, or simply have candid conversations with people outside your usual circle."
      }
    }
  },
  {
    "id": "affect-heuristic",
    "name": "Affect Heuristic",
    "tiers": {
      "1": {
        "definition": "When your feelings about something change what you think is true about it.",
        "scenarioDoneTo": "You love dogs, so when someone says 'Dogs sometimes bite people,' you think 'That almost never happens!' But if you're scared of dogs, you think it happens all the time.",
        "scenarioYouDo": "You really want a new video game. Because you want it so badly, you convince yourself it's educational so your parents will buy it.",
        "challenge": {
          "scenario": "A kid is scared of thunderstorms. They think lightning strikes happen way more often than they actually do, because the fear makes it seem more dangerous.",
          "options": ["Availability Heuristic", "Affect Heuristic", "Negativity Bias"],
          "correct": 1
        },
        "tip": "When you feel strongly about something, pause and ask: 'Am I thinking this because it's true, or because of how I feel?'"
      },
      "2": {
        "definition": "A mental shortcut where your current emotions heavily influence your judgments about risks, benefits, and facts — what feels good seems less risky, what feels bad seems more dangerous.",
        "scenarioDoneTo": "After a scary news story about a plane crash, you feel flying is extremely dangerous and consider driving instead — even though driving is statistically far more risky per mile traveled.",
        "scenarioYouDo": "You love your new business idea so much that you unconsciously downplay the financial risks. Everything about it 'feels right,' so you skip due diligence.",
        "challenge": {
          "scenario": "When people feel positive about a technology (like nuclear power for supporters), they rate its benefits as high and its risks as low. Opponents do the exact opposite — despite having access to the same facts.",
          "options": ["Confirmation Bias", "Framing Effect", "Affect Heuristic", "Bandwagon Effect"],
          "correct": 2
        },
        "tip": "Separate feelings from facts by writing them in two columns. Ask: 'What does the data say?' independently from 'How do I feel about this?'"
      },
      "3": {
        "definition": "The reliance on current emotional state to make quick judgments — if something feels good, the brain rates it as low-risk and high-benefit; if it feels bad, the brain rates it as high-risk and low-benefit, often overriding analytical thinking.",
        "scenarioDoneTo": "Financial markets swing on sentiment: investor 'mood' (measured by consumer confidence indices and even weather) predicts stock prices better than many fundamental analyses, because affect drives buying and selling decisions.",
        "scenarioYouDo": "You champion a strategic initiative at work partly because you're excited about the technology. Your enthusiasm leads you to present optimistic projections and dismiss cautionary data — the excitement is doing the analysis for you.",
        "challenge": {
          "scenario": "Slovic's research demonstrated that when people were told a technology had high benefits, they automatically assumed it had low risks (and vice versa) — even when benefits and risks were logically independent.",
          "options": ["Affect Heuristic", "Halo Effect", "Optimism Bias", "Framing Effect"],
          "correct": 0
        },
        "tip": "Introduce mandatory cooling-off periods before major decisions. Evaluate risks and benefits separately using structured frameworks, not gut feelings. The more excited you are, the more rigor you need."
      }
    }
  },
  {
    "id": "gamblers-fallacy",
    "name": "Gambler's Fallacy",
    "tiers": {
      "1": {
        "definition": "When you think something is 'due' to happen because it hasn't happened in a while, even though each try is random.",
        "scenarioDoneTo": "You flip a coin and get heads 5 times in a row. Everyone yells 'It HAS to be tails next!' But the coin doesn't remember what happened before — it's still 50/50.",
        "scenarioYouDo": "You're playing a board game and haven't rolled a 6 in a long time, so you say 'I'm definitely getting a 6 this time!' The dice don't know what your last rolls were.",
        "challenge": {
          "scenario": "After losing five rounds of a card game, a kid bets extra the next round because they think they're 'due for a win.'",
          "options": ["Gambler's Fallacy", "Optimism Bias", "Sunk Cost Fallacy"],
          "correct": 0
        },
        "tip": "Remember: coins, dice, and cards don't have memory! Each try is completely fresh, no matter what happened before."
      },
      "2": {
        "definition": "The mistaken belief that if something happens more frequently than normal during a given period, it will happen less frequently in the future (or vice versa), when the events are actually independent.",
        "scenarioDoneTo": "At a roulette table, the ball has landed on black 8 times in a row. The entire table piles money on red, believing it 'must' come up next. It lands on black again.",
        "scenarioYouDo": "You've applied to 10 jobs with no response. You tell yourself 'Statistically, the next one HAS to work out' — but each application is evaluated independently.",
        "challenge": {
          "scenario": "In 1913 at Monte Carlo, the roulette ball landed on black 26 times in a row. Gamblers lost millions betting on red, convinced the streak 'had to' end.",
          "options": ["Anchoring Bias", "Gambler's Fallacy", "Availability Heuristic", "Sunk Cost Fallacy"],
          "correct": 1
        },
        "tip": "Ask yourself: 'Does this event actually know what happened before?' If the answer is no (dice, coins, lottery), past results tell you nothing about the future."
      },
      "3": {
        "definition": "The erroneous belief that the probability of a random event is influenced by previous outcomes — rooted in a misunderstanding of the law of large numbers, which describes long-run frequencies, not short-run corrections.",
        "scenarioDoneTo": "Lottery systems exploit this: 'hot' and 'cold' number displays in lottery terminals encourage players to believe in patterns that don't exist in random drawings.",
        "scenarioYouDo": "As a basketball coach, you bench a player who missed their last 5 free throws, believing they're in a 'cold streak.' Statistical analysis shows each free throw is largely independent — you're reacting to randomness.",
        "challenge": {
          "scenario": "The 'hot hand fallacy' debate: researchers initially called belief in basketball shooting streaks a fallacy, but later studies found a small but real hot hand effect — showing the importance of testing assumptions rather than just labeling them as biases.",
          "options": ["Gambler's Fallacy", "Availability Heuristic", "Confirmation Bias", "Dunning-Kruger Effect"],
          "correct": 0
        },
        "tip": "Distinguish between truly independent events (dice, coins, lottery) and potentially correlated events (sports, performance). For independent events, base rates are all you need — streaks are meaningless noise."
      }
    }
  },
  {
    "id": "bystander",
    "name": "Bystander Effect",
    "tiers": {
      "1": {
        "definition": "When you don't help because you think someone else will do it.",
        "scenarioDoneTo": "You see a kid drop their books in a crowded hallway. Everyone walks past, each thinking 'Someone else will help.' Nobody does.",
        "scenarioYouDo": "You notice trash on the classroom floor but don't pick it up because you think someone else will. After class, the trash is still there.",
        "challenge": {
          "scenario": "A kid falls off their bike in a park full of people. Everyone looks but nobody helps, each person thinking 'Surely someone closer will help.'",
          "options": ["Status Quo Bias", "Bystander Effect", "In-Group Bias"],
          "correct": 1
        },
        "tip": "Be the one who helps first! When you help, it makes other people want to help too."
      },
      "2": {
        "definition": "The phenomenon where individuals are less likely to offer help in an emergency when other people are present — the more bystanders, the less likely any single person is to intervene.",
        "scenarioDoneTo": "You witness someone collapse on a busy street. You wait for someone else to call 911, and so does everyone else. Minutes pass before anyone acts.",
        "scenarioYouDo": "In a team meeting, the manager asks for someone to take on an extra task. You stay silent, assuming one of the other 12 people will volunteer. Nobody does.",
        "challenge": {
          "scenario": "Darley and Latané's research showed that when a person was alone and heard someone in distress, they helped 85% of the time. With 4 others present, the rate dropped to 31%.",
          "options": ["Bandwagon Effect", "Status Quo Bias", "Bystander Effect", "In-Group Bias"],
          "correct": 2
        },
        "tip": "In emergencies, point at a specific person and give direct instructions: 'You in the blue jacket — call 911.' Breaking the anonymity breaks the effect."
      },
      "3": {
        "definition": "The diffusion of responsibility that occurs in groups, where each individual feels less personal obligation to act because they assume others will — leading to collective inaction even when every individual, alone, would have intervened.",
        "scenarioDoneTo": "The 1964 Kitty Genovese case popularized this concept: allegedly 38 witnesses heard her attack and none called police. While later reporting nuanced the story, follow-up experiments consistently confirmed the effect in controlled settings.",
        "scenarioYouDo": "Your company's code review process has 5 reviewers on each pull request. Critical bugs slip through because each reviewer assumes someone else will do the thorough review, leading to diffused responsibility and superficial checks.",
        "challenge": {
          "scenario": "Online bystander effect: threads where someone asks for help get faster responses when directed to a smaller audience. Mass-emailed requests ('Can anyone help?') consistently get fewer responses than individually addressed ones.",
          "options": ["Bystander Effect", "Bandwagon Effect", "False Consensus Effect", "Status Quo Bias"],
          "correct": 0
        },
        "tip": "Assign explicit ownership. In teams, replace 'Can someone...' with 'Sarah, could you...' In emergencies, make eye contact with one specific person. Structure fights diffusion."
      }
    }
  },
  {
    "id": "peak-end",
    "name": "Peak-End Rule",
    "tiers": {
      "1": {
        "definition": "When you judge a whole experience based on the best (or worst) part and how it ended, ignoring everything in between.",
        "scenarioDoneTo": "You go to a great birthday party. The cake was amazing and you got a cool goodie bag at the end. You say it was the best party ever — even though you were bored for most of it.",
        "scenarioYouDo": "You had a great vacation but the flight home was terrible. You tell everyone the vacation was 'just okay' because of how it ended.",
        "challenge": {
          "scenario": "A kid goes to an amusement park. They waited in long lines all day, but the last ride was amazing. They tell everyone it was the best day ever.",
          "options": ["Recency Bias", "Peak-End Rule", "Optimism Bias"],
          "correct": 1
        },
        "tip": "After an experience, think about the WHOLE thing, not just the highlight or the ending. Try listing all the parts — you might remember it differently."
      },
      "2": {
        "definition": "The tendency to judge an experience largely based on how it felt at its most intense point (peak) and at its end, rather than the average of every moment.",
        "scenarioDoneTo": "Kahneman's 'cold water' experiment: people preferred a longer period of discomfort (60 seconds of cold water + 30 seconds of slightly warmer water) over a shorter but purely cold period — because the ending was better.",
        "scenarioYouDo": "You design a customer experience to have a 'wow moment' in the middle and a pleasant surprise at the end, knowing people will rate the entire experience higher even if the rest was average.",
        "challenge": {
          "scenario": "Patients rated a longer, more painful medical procedure as less unpleasant than a shorter one — because the longer one ended with gradually decreasing pain.",
          "options": ["Peak-End Rule", "Framing Effect", "Recency Bias", "Negativity Bias"],
          "correct": 0
        },
        "tip": "When evaluating experiences, keep a real-time log. Your in-the-moment notes will give a more accurate picture than your after-the-fact memory."
      },
      "3": {
        "definition": "A heuristic where people evaluate past experiences based primarily on the emotional intensity at the peak moment and the final moment — duration of the experience has surprisingly little impact (duration neglect).",
        "scenarioDoneTo": "Disney theme parks are engineered around this principle: rides build to an intense peak, wait times include engaging pre-show experiences, and exits route through gift shops that create a positive final impression.",
        "scenarioYouDo": "As a UX designer, you front-load frustrating setup steps and ensure the final interaction is delightful, knowing that peak-end evaluation will make users rate the overall experience favorably despite the rough start.",
        "challenge": {
          "scenario": "Colonoscopy studies showed that when doctors slightly extended the procedure with reduced discomfort at the end (adding more total pain but a better ending), patients rated the experience as less painful and were more likely to return for follow-ups.",
          "options": ["Peak-End Rule", "Framing Effect", "Affect Heuristic", "Status Quo Bias"],
          "correct": 0
        },
        "tip": "Design endings deliberately — in presentations, customer journeys, and even difficult conversations. People's lasting impression is disproportionately shaped by the final moments."
      }
    }
  },
  {
    "id": "curse-of-knowledge",
    "name": "Curse of Knowledge",
    "tiers": {
      "1": {
        "definition": "When you know something and you can't imagine what it's like to NOT know it, so you explain it badly.",
        "scenarioDoneTo": "Your older sibling tries to help you with math but gets frustrated because 'it's so obvious!' — they forgot what it was like to not understand it yet.",
        "scenarioYouDo": "You try to explain your favorite video game to a friend who's never played it. You use all the game words and they have no idea what you're talking about.",
        "challenge": {
          "scenario": "A kid tries to give directions to their house but says 'Turn at the big tree' and 'Go past where the old store used to be.' The other person has never been to that neighborhood.",
          "options": ["False Consensus Effect", "Curse of Knowledge", "Dunning-Kruger Effect"],
          "correct": 1
        },
        "tip": "When explaining something, pretend the other person knows NOTHING about it. Start from the very beginning — it's better to over-explain than to confuse them."
      },
      "2": {
        "definition": "When you know something, it becomes hard to imagine not knowing it, leading you to assume others have the same background knowledge you do — making communication less effective.",
        "scenarioDoneTo": "A professor writes exam questions that seem 'straightforward' to them but are baffling to students because the professor can't separate what they know from what a learner knows.",
        "scenarioYouDo": "You write documentation for a software tool using jargon and skipping 'obvious' steps. New users are completely lost because what's obvious to you is invisible to them.",
        "challenge": {
          "scenario": "In the famous 'tappers and listeners' study, people tapped out well-known songs and predicted listeners would recognize 50% of them. Actual recognition rate: 2.5%.",
          "options": ["False Consensus Effect", "Dunning-Kruger Effect", "Curse of Knowledge", "Spotlight Effect"],
          "correct": 2
        },
        "tip": "Test your explanations on someone with zero background. If they can't follow, simplify — you're almost certainly overestimating what 'everyone knows.'"
      },
      "3": {
        "definition": "A cognitive bias where better-informed individuals find it extremely difficult to think about problems from the perspective of lesser-informed people — expertise literally rewires how you see the problem, making it impossible to 'unknow' what you know.",
        "scenarioDoneTo": "In business, this creates massive product failures: experts design interfaces, policies, and instructions that make perfect sense to insiders but are incomprehensible to the actual users they're meant for.",
        "scenarioYouDo": "You design a training program for new hires that covers advanced concepts quickly because the basics seem 'trivially obvious.' Six months later, new hire retention is down and exit surveys cite 'inadequate onboarding.'",
        "challenge": {
          "scenario": "Studies show that even when experts are told to estimate what novices know and explicitly try to adjust their expectations downward, they still significantly overestimate novice knowledge — awareness of the bias barely reduces it.",
          "options": ["Curse of Knowledge", "False Consensus Effect", "Dunning-Kruger Effect", "Planning Fallacy"],
          "correct": 0
        },
        "tip": "Use actual user testing with real novices — never rely on expert reviewers to predict what novices will find confusing. The only reliable antidote is empirical feedback from the actual target audience."
      }
    }
  },
  {
    "id": "survivorship",
    "name": "Survivorship Bias",
    "tiers": {
      "1": {
        "definition": "When you only look at the winners and forget about everyone who tried and failed.",
        "scenarioDoneTo": "Your uncle says 'Bill Gates dropped out of college and he's a billionaire!' He forgets about the millions of people who dropped out and are struggling.",
        "scenarioYouDo": "You see famous YouTubers making millions and think 'I should start a channel!' You don't see the 99% of YouTubers who make almost nothing.",
        "challenge": {
          "scenario": "A kid sees their favorite athlete and says 'I don't need to study, I'll just become a pro player!' They only see the few who made it, not the thousands who didn't.",
          "options": ["Optimism Bias", "Survivorship Bias", "Availability Heuristic"],
          "correct": 1
        },
        "tip": "When you see a success story, ask: 'How many people tried the same thing and DIDN'T succeed?' The answer is usually a LOT."
      },
      "2": {
        "definition": "The logical error of focusing on the people or things that made it past some selection process and overlooking those that didn't — typically because failures are invisible.",
        "scenarioDoneTo": "Business books study only successful companies and extract 'rules for success.' But companies that followed the same rules and failed aren't in the book — because nobody writes about failures.",
        "scenarioYouDo": "You read interviews with startup founders and adopt their habits (waking at 5 AM, cold showers, etc.) believing these caused their success. You don't see the thousands who did the same things and failed.",
        "challenge": {
          "scenario": "During WWII, the military wanted to add armor to planes. They studied returning planes' bullet holes. Abraham Wald pointed out they should armor where returning planes WEREN'T hit — because planes hit there didn't return.",
          "options": ["Survivorship Bias", "Confirmation Bias", "Availability Heuristic", "Anchoring Bias"],
          "correct": 0
        },
        "tip": "Always ask: 'Am I only seeing the survivors?' Look for data on failures, not just successes. The lessons are often in what didn't work."
      },
      "3": {
        "definition": "A form of selection bias where analyzing only subjects that passed a selection criterion (survived) and ignoring those that didn't leads to false conclusions about what caused success — the silent evidence of failures is invisible.",
        "scenarioDoneTo": "Mutual fund performance data exhibits survivorship bias: poorly performing funds are closed and merged into other funds, making the industry's overall track record look better than it actually is.",
        "scenarioYouDo": "Your team's retrospective only examines successful projects to extract best practices. By never analyzing failed projects with equal rigor, you build a playbook that confuses correlation with causation.",
        "challenge": {
          "scenario": "The 'cat falling' study found cats brought to vets from higher falls had better survival rates than lower falls. Likely explanation: cats that died from high falls were never brought to the vet, so they weren't in the data.",
          "options": ["Availability Heuristic", "Survivorship Bias", "Confirmation Bias", "Fundamental Attribution Error"],
          "correct": 1
        },
        "tip": "Systematically seek out 'the graveyard' — failed startups, closed funds, rejected applications. Any dataset that only includes survivors will mislead you. Build processes that capture failure data with equal fidelity."
      }
    }
  },
  {
    "id": "zero-risk",
    "name": "Zero-Risk Bias",
    "tiers": {
      "1": {
        "definition": "When you'd rather get rid of one small risk completely than reduce a much bigger risk a lot.",
        "scenarioDoneTo": "Your school bans running on the playground (zero risk of tripping!) but doesn't fix the broken fence by the road, which is actually more dangerous.",
        "scenarioYouDo": "You spend all your time studying for the one easy quiz coming up (guaranteed A!) instead of studying for the big test worth 10 times more points.",
        "challenge": {
          "scenario": "A town spends its entire safety budget making one small park 100% safe instead of making improvements to five dangerous intersections.",
          "options": ["Status Quo Bias", "Zero-Risk Bias", "Planning Fallacy"],
          "correct": 1
        },
        "tip": "Think about the BIG picture. Ask: 'What option helps the MOST people (or saves the MOST risk) overall?'"
      },
      "2": {
        "definition": "The preference to completely eliminate one risk over making a larger reduction in overall risk — people love certainty, even when it's mathematically worse.",
        "scenarioDoneTo": "After a rare shark attack, a beach installs a million-dollar shark net (reducing near-zero risk to zero). Meanwhile, the unguarded swimming pool at the community center — which has far more drownings — gets no funding.",
        "scenarioYouDo": "You choose a health insurance plan that covers a rare condition with 100% coverage over a plan that has better overall coverage but a small co-pay — because eliminating that one risk completely feels more comforting.",
        "challenge": {
          "scenario": "People chose to completely eliminate one contaminant from their water supply rather than reduce a more dangerous contaminant by 80% — even when the larger reduction would prevent more illness overall.",
          "options": ["Framing Effect", "Affect Heuristic", "Zero-Risk Bias", "Availability Heuristic"],
          "correct": 2
        },
        "tip": "Compare options by total expected harm avoided, not by whether any single risk reaches zero. The allure of 'zero' often means accepting more total risk."
      },
      "3": {
        "definition": "The preference for reducing a small risk to zero over a proportionally greater reduction in a larger risk — driven by the psychological certainty of complete elimination, even when the alternative reduces more total expected harm.",
        "scenarioDoneTo": "Government regulation often prioritizes complete elimination of small, visible risks (e.g., trace chemicals in food) while systemic larger risks (e.g., obesity, air pollution) receive proportionally less attention and funding.",
        "scenarioYouDo": "As a security engineer, you invest heavily in eliminating a low-probability attack vector entirely while the high-probability vectors only get partial mitigation — your security posture is worse overall, but the zero-risk items look great on audit reports.",
        "challenge": {
          "scenario": "Experiments show that people will pay significantly more to reduce a risk from 1% to 0% than from 5% to 1% — even though the second option eliminates four times more risk.",
          "options": ["Zero-Risk Bias", "Affect Heuristic", "Anchoring Bias", "Framing Effect"],
          "correct": 0
        },
        "tip": "Quantify risk reduction in absolute terms (lives saved, dollars preserved, incidents prevented) rather than evaluating whether any category reaches zero. Optimize for total risk reduction across the portfolio."
      }
    }
  },
  {
    "id": "just-world",
    "name": "Just-World Hypothesis",
    "tiers": {
      "1": {
        "definition": "When you think bad things only happen to people who deserve it, and good things happen to good people.",
        "scenarioDoneTo": "A kid gets bullied and someone says 'Well, they must have done something to deserve it.' That's not fair — sometimes bad things happen to people for no reason.",
        "scenarioYouDo": "You see someone get a bad grade and think 'They probably didn't study.' Maybe they studied really hard but have a learning difference you don't know about.",
        "challenge": {
          "scenario": "A kid's bike gets stolen and their classmate says 'You should have locked it better.' The bike WAS locked — sometimes bad things just happen.",
          "options": ["Fundamental Attribution Error", "Just-World Hypothesis", "Self-Serving Bias"],
          "correct": 1
        },
        "tip": "When something bad happens to someone, instead of thinking about what THEY did wrong, think about how you can help."
      },
      "2": {
        "definition": "The belief that the world is fundamentally fair — that people generally get what they deserve and deserve what they get — leading to victim-blaming and complacency about injustice.",
        "scenarioDoneTo": "After hearing about someone losing their job, people's first instinct is to wonder what the person did wrong — rather than considering economic forces, company decisions, or bad luck.",
        "scenarioYouDo": "When you see a homeless person, your immediate thought is 'They must have made bad choices.' This protects your belief that the world is fair and that the same thing couldn't happen to you.",
        "challenge": {
          "scenario": "Lerner's experiments showed that when observers watched someone receive electric shocks for no reason, they began to devalue and blame the victim — because accepting that suffering was random threatened their worldview.",
          "options": ["Fundamental Attribution Error", "In-Group Bias", "Just-World Hypothesis", "Negativity Bias"],
          "correct": 2
        },
        "tip": "When you catch yourself thinking someone 'must have deserved' their misfortune, challenge that thought. Ask what systemic or random factors might have played a role."
      },
      "3": {
        "definition": "The cognitive bias that the world is inherently just — that actions always have morally fair consequences — which leads people to rationalize injustice by blaming victims, and creates false confidence that personal virtue guarantees safety from misfortune.",
        "scenarioDoneTo": "This bias shapes entire legal systems: juries are more likely to blame sexual assault victims who 'dressed provocatively' — because accepting that terrible things happen to innocent people is psychologically threatening.",
        "scenarioYouDo": "You evaluate employees' career trajectories and unconsciously attribute outcomes to merit alone, ignoring systemic advantages like connections, timing, and demographics. This shapes hiring and promotion decisions in ways that perpetuate inequality.",
        "challenge": {
          "scenario": "Research shows that people with a stronger just-world belief are more likely to blame poverty on individual failings and less likely to support social safety nets — even when presented with structural economic data.",
          "options": ["Just-World Hypothesis", "Fundamental Attribution Error", "Status Quo Bias", "In-Group Bias"],
          "correct": 0
        },
        "tip": "Recognize that fairness is something we build, not something the universe guarantees. Separate evaluation of causes (often systemic) from moral judgment of affected individuals."
      }
    }
  },
  {
    "id": "loss-aversion",
    "name": "Loss Aversion",
    "tiers": {
      "1": {
        "definition": "When losing something feels WAY worse than gaining the same thing feels good.",
        "scenarioDoneTo": "You find $10 on the ground and feel happy. The next day you lose $10 from your pocket and feel TERRIBLE — way worse than the $10 find felt good.",
        "scenarioYouDo": "You have a toy you never play with. Someone offers to trade you a better toy, but you say no because giving up YOUR toy feels too bad — even though the new one is cooler.",
        "challenge": {
          "scenario": "A kid won't trade their old game for a newer, better one because they can't stand the idea of giving up something they already have.",
          "options": ["Status Quo Bias", "Loss Aversion", "Sunk Cost Fallacy"],
          "correct": 1
        },
        "tip": "Ask yourself: 'If I didn't already have this, would I choose it over the other option?' If not, the only reason you're keeping it is fear of losing it."
      },
      "2": {
        "definition": "The tendency for people to prefer avoiding losses over acquiring equivalent gains — the pain of losing $100 is psychologically about twice as powerful as the pleasure of gaining $100.",
        "scenarioDoneTo": "Free trial subscriptions exploit this: once you've 'had' the premium features for 30 days, canceling feels like losing something, even though you never paid for it.",
        "scenarioYouDo": "You hold onto a losing stock much longer than you should, hoping it will recover to your purchase price, while you'd never buy that same stock at its current price if you didn't already own it.",
        "challenge": {
          "scenario": "Kahneman and Tversky found that people need to gain about $200 to compensate for the negative feeling of losing $100. Losses are felt roughly twice as intensely as equivalent gains.",
          "options": ["Sunk Cost Fallacy", "Anchoring Bias", "Loss Aversion", "Status Quo Bias"],
          "correct": 2
        },
        "tip": "Reframe decisions: instead of 'I'll lose X,' think 'I'll gain Y.' Research shows that framing the same choice as a gain rather than a loss changes people's decisions dramatically."
      },
      "3": {
        "definition": "A foundational principle of Prospect Theory: losses loom larger than gains, with most estimates suggesting losses are weighted approximately 1.5 to 2.5 times more heavily — creating systematic distortions in risk assessment, negotiation, and decision-making.",
        "scenarioDoneTo": "Entire industries exploit loss aversion: insurance for low-value items, extended warranties, and 'limited time offer' marketing all leverage the outsized fear of loss to drive purchasing decisions that are mathematically unfavorable to the buyer.",
        "scenarioYouDo": "In salary negotiations, you value your current compensation as a reference point and perceive any reduction in any component (even if offset by larger gains elsewhere) as a 'loss' — making you reject packages with higher total value.",
        "challenge": {
          "scenario": "The 'endowment effect' — where owners value an item more than buyers — is largely driven by loss aversion. In experiments, mug owners demanded about twice what buyers would pay for the same mug.",
          "options": ["Loss Aversion", "Anchoring Bias", "Status Quo Bias", "Mere Exposure Effect"],
          "correct": 0
        },
        "tip": "Make decisions from a 'zero-based' perspective: imagine you own nothing and are choosing between all options fresh. Strip away ownership status and evaluate purely on forward-looking value."
      }
    }
  },
  {
    "id": "backfire",
    "name": "Backfire Effect",
    "tiers": {
      "1": {
        "definition": "When someone shows you proof that you're wrong, but instead of changing your mind, you believe your wrong idea even MORE strongly.",
        "scenarioDoneTo": "You think your favorite athlete is the greatest ever. Someone shows you stats proving another athlete is better. Instead of considering it, you get angry and even MORE convinced your pick is the best.",
        "scenarioYouDo": "Your friend shows you that a 'fact' you shared isn't true. Instead of saying 'Oh, I was wrong,' you start arguing harder and find reasons to keep believing it.",
        "challenge": {
          "scenario": "A kid believes carrots make you see in the dark. Their teacher explains this is a myth. The kid goes home and tells their parents 'My teacher is wrong — carrots DEFINITELY help you see in the dark!'",
          "options": ["Confirmation Bias", "Backfire Effect", "Authority Bias"],
          "correct": 1
        },
        "tip": "When someone challenges what you believe, try to listen without getting upset. It's okay to be wrong — that's how you learn!"
      },
      "2": {
        "definition": "The phenomenon where correcting a person's misconception can actually strengthen their belief in the misconception, especially when the belief is tied to their identity or worldview.",
        "scenarioDoneTo": "Your brain treats challenges to core beliefs like physical threats — triggering the same defensive response. Evidence against your belief literally feels like an attack.",
        "scenarioYouDo": "When a fact-checker debunks a political claim you shared, instead of accepting the correction, you dismiss the fact-checker as biased and seek out sources that support the original claim.",
        "challenge": {
          "scenario": "Studies found that showing people corrective information about political misconceptions (like WMDs in Iraq) actually made those with strong prior beliefs MORE confident in the misconception.",
          "options": ["Confirmation Bias", "Backfire Effect", "Reactance", "Authority Bias"],
          "correct": 1
        },
        "tip": "Separate your identity from your beliefs. A belief being wrong doesn't make YOU wrong — it means you're about to learn something new."
      },
      "3": {
        "definition": "A cognitive phenomenon where individuals presented with evidence that contradicts a firmly held belief not only resist updating that belief but actually strengthen their commitment to it — effectively inverting the normal learning process.",
        "scenarioDoneTo": "Note: recent research has questioned the robustness and replicability of the backfire effect, suggesting it may be less common than initially thought — but when it does occur (typically for identity-linked beliefs), it is powerful.",
        "scenarioYouDo": "When presented with rigorous data contradicting your department's strategy, you find yourself mentally constructing more elaborate justifications rather than updating your position — the quality of counter-evidence triggers proportional defensive reasoning.",
        "challenge": {
          "scenario": "Nyhan and Reifler's original studies showed the effect clearly, but subsequent replications have been mixed. This itself demonstrates how science self-corrects — the researchers updated their own views when new evidence emerged.",
          "options": ["Backfire Effect", "Confirmation Bias", "Dunning-Kruger Effect", "Reactance"],
          "correct": 0
        },
        "tip": "Pre-commit to updating: before examining evidence, state aloud what would change your mind. This creates accountability and reduces defensive processing when that evidence actually appears."
      }
    }
  },
  {
    "id": "normalcy",
    "name": "Normalcy Bias",
    "tiers": {
      "1": {
        "definition": "When you think 'That bad thing will never happen to me' so you don't prepare for it.",
        "scenarioDoneTo": "A storm warning comes on the news. Your family doesn't prepare because 'we've never had a bad storm hit our house before.' Then a big storm hits and you're not ready.",
        "scenarioYouDo": "You don't bother backing up your school project on your computer because 'my computer has never crashed before.' Then it crashes the night before it's due.",
        "challenge": {
          "scenario": "A fire alarm goes off at school and half the students don't move right away because they assume it's just a drill or a false alarm.",
          "options": ["Optimism Bias", "Normalcy Bias", "Status Quo Bias"],
          "correct": 1
        },
        "tip": "Hope for the best, prepare for the worst! It only takes a few minutes to have a backup plan, and you'll be glad you did if something goes wrong."
      },
      "2": {
        "definition": "The tendency to underestimate the possibility and impact of a disaster because it has never happened before, leading to inadequate preparation and delayed response.",
        "scenarioDoneTo": "Before Hurricane Katrina, many New Orleans residents ignored mandatory evacuation orders because previous hurricane warnings had been false alarms. The cost of normalcy bias was catastrophic.",
        "scenarioYouDo": "You don't have an emergency savings fund because you've always had steady income. You can't imagine a scenario where you'd suddenly need 6 months of expenses — until it happens.",
        "challenge": {
          "scenario": "In building evacuations, studies show most people take an average of 3-5 minutes to begin moving after an alarm sounds — they first normalize the situation by gathering belongings, finishing conversations, or waiting to see what others do.",
          "options": ["Bystander Effect", "Status Quo Bias", "Normalcy Bias", "Optimism Bias"],
          "correct": 2
        },
        "tip": "Create automatic response plans for emergencies BEFORE they happen. When the alarm sounds, follow the plan — don't waste critical time deciding if it's 'real.'"
      },
      "3": {
        "definition": "A cognitive bias causing people to disbelieve or minimize threat warnings, leading to failure to prepare and delayed reactions during actual disasters — rooted in the assumption that since things have always been fine, they will continue to be.",
        "scenarioDoneTo": "Before the 2008 financial crisis, regulators and banks dismissed warnings about mortgage-backed securities because 'housing prices have never fallen nationwide.' The absence of precedent was mistaken for impossibility.",
        "scenarioYouDo": "Your organization's disaster recovery plan sits untested because leadership believes 'we've never had a major outage.' When one inevitably occurs, the recovery process fails because assumptions were never validated against reality.",
        "challenge": {
          "scenario": "The concept of 'black swan' events — rare, high-impact occurrences that are rationalized in hindsight — is directly related to normalcy bias. Our inability to imagine unprecedented events makes us systematically underprepared for them.",
          "options": ["Normalcy Bias", "Optimism Bias", "Status Quo Bias", "Planning Fallacy"],
          "correct": 0
        },
        "tip": "Conduct regular 'pre-mortems': imagine the worst has already happened and work backward to identify failure points. Test disaster plans under realistic conditions — paper plans are worth nothing untested."
      }
    }
  },
  {
    "id": "decoy",
    "name": "Decoy Effect",
    "tiers": {
      "1": {
        "definition": "When a third option that nobody would pick is added just to make one of the other options look better.",
        "scenarioDoneTo": "A movie theater has Small popcorn for $3 and Large for $7. Nobody buys Large. They add Medium for $6.50 and suddenly everyone buys Large because it's 'only 50 cents more than Medium!'",
        "scenarioYouDo": "You're trying to get your parents to say yes to a pet dog. You ask for a horse first (they say no), then a dog seems totally reasonable by comparison.",
        "challenge": {
          "scenario": "A toy store puts a $40 toy right next to a $38 toy that's way worse. Now the $40 toy looks like an amazing deal compared to it.",
          "options": ["Anchoring Bias", "Decoy Effect", "Framing Effect"],
          "correct": 1
        },
        "tip": "When choosing between options, cover up the middle one and ask: 'Would I still pick the same thing?' If yes, great. If not, you might be tricked by a decoy."
      },
      "2": {
        "definition": "A phenomenon in marketing where adding a third, asymmetrically dominated option (the decoy) changes preference between the other two options — making one appear superior by comparison.",
        "scenarioDoneTo": "Subscription pricing often uses this: Basic ($5), Premium ($15), Pro ($16). Nobody picks Premium, but it makes Pro look like incredible value for just $1 more — exactly as intended.",
        "scenarioYouDo": "When presenting project proposals to your boss, you include a deliberately weak third option to make your preferred proposal look stronger by comparison.",
        "challenge": {
          "scenario": "The Economist famously offered: Web-only ($59), Print-only ($125), Print+Web ($125). Nobody chose print-only, but removing it changed preferences — without the decoy, more people chose web-only.",
          "options": ["Anchoring Bias", "Framing Effect", "Decoy Effect", "Bandwagon Effect"],
          "correct": 2
        },
        "tip": "Evaluate each option on its own merits, not relative to other options. Ask: 'Would I be happy with this at this price if it were the only option?'"
      },
      "3": {
        "definition": "The asymmetric dominance effect: introducing a third option that is clearly inferior to one alternative (but not the other) shifts preference toward the dominant option — violating the principle of 'independence of irrelevant alternatives' in rational choice theory.",
        "scenarioDoneTo": "Real estate agents sometimes show an overpriced, inferior house before showing the target property — the contrast makes the target seem like a much better deal, even if it's also overpriced.",
        "scenarioYouDo": "In product management, you design pricing tiers specifically to create decoy effects that steer customers toward the highest-margin option, using the decoy tier's sole purpose as a comparison anchor.",
        "challenge": {
          "scenario": "Studies show the decoy effect works even when participants are told about it — awareness reduces but doesn't eliminate the effect, because the comparison still changes how options are perceived.",
          "options": ["Decoy Effect", "Anchoring Bias", "Framing Effect", "Mere Exposure Effect"],
          "correct": 0
        },
        "tip": "Create independent scorecards for each option before comparing them. Include only the criteria that matter to you. If an option only looks good relative to another option (rather than on its own merits), suspect a decoy."
      }
    }
  },
  {
    "id": "reactance",
    "name": "Reactance",
    "tiers": {
      "1": {
        "definition": "When someone tells you that you CAN'T do something and suddenly you want to do it even more.",
        "scenarioDoneTo": "Your parent says 'Don't touch the cookies!' Now those cookies are ALL you can think about, even though you weren't hungry before.",
        "scenarioYouDo": "A sign says 'Keep Off the Grass.' Now you really want to walk on the grass, even though you had no plans to before you saw the sign.",
        "challenge": {
          "scenario": "A kid is told they're too young to watch a scary movie. Now that movie is the ONLY thing they want to watch.",
          "options": ["Backfire Effect", "Reactance", "Bandwagon Effect"],
          "correct": 1
        },
        "tip": "When you suddenly want something after being told you can't have it, ask yourself: 'Did I actually want this BEFORE someone said no?'"
      },
      "2": {
        "definition": "The motivational reaction to rules, regulations, or persuasion attempts that threaten or eliminate specific behavioral freedoms — the stronger the threat to freedom, the stronger the desire to restore it.",
        "scenarioDoneTo": "When a government bans a book, sales of that book spike dramatically. The ban creates desirability that didn't exist before.",
        "scenarioYouDo": "Your boss mandates a new process and you resist it — not because the process is bad, but because you feel your autonomy was violated by the mandate. If you'd been consulted, you might have supported it.",
        "challenge": {
          "scenario": "Anti-smoking ads that use commanding language ('Don't smoke!') have been shown to increase smoking desire in some teenagers, while informational approaches are more effective.",
          "options": ["Backfire Effect", "Reactance", "Authority Bias", "Bandwagon Effect"],
          "correct": 1
        },
        "tip": "Recognize when your resistance is about the MESSAGE versus the MESSENGER. If the only reason you oppose something is because you were told to do it, that's reactance talking."
      },
      "3": {
        "definition": "A motivational state triggered by the perception that one's freedom of choice is being threatened or eliminated — leading to increased desire for the restricted option and hostility toward the source of restriction, regardless of the option's actual merits.",
        "scenarioDoneTo": "The 'Streisand effect' in media: attempts to censor or suppress information often amplify its spread. Legal threats to remove content routinely result in millions more views than the content would have received organically.",
        "scenarioYouDo": "You introduce a mandatory compliance training program without consulting the team. The content is excellent, but completion rates are lower than voluntary programs because the mandate triggers reactance — people resist what they feel was imposed.",
        "challenge": {
          "scenario": "Brehm's theory predicts that reactance is proportional to the importance of the threatened freedom, the proportion of freedoms threatened, and the strength of the threat — explaining why heavy-handed persuasion often backfires.",
          "options": ["Reactance", "Backfire Effect", "Status Quo Bias", "Authority Bias"],
          "correct": 0
        },
        "tip": "When leading change, offer choices within constraints rather than issuing mandates. People accept the same outcome more readily when they feel they chose it versus being forced into it."
      }
    }
  },
  {
    "id": "groupthink",
    "name": "Groupthink",
    "tiers": {
      "1": {
        "definition": "When everyone in a group agrees with each other just to get along, even when some of them think the idea is bad.",
        "scenarioDoneTo": "Your friend group decides to see a movie you don't want to see. Everyone says 'yeah, sounds great!' because nobody wants to be the one who disagrees. Turns out, nobody actually wanted to see it.",
        "scenarioYouDo": "In a group project, you go along with a plan you think won't work because everyone else seems into it. You don't want to be the difficult one.",
        "challenge": {
          "scenario": "A class votes on a field trip destination. A few popular kids say 'Let's go to the museum!' Everyone else agrees, even though most of them would rather go to the zoo.",
          "options": ["Bandwagon Effect", "Groupthink", "False Consensus Effect"],
          "correct": 1
        },
        "tip": "Before a group decides, have everyone write down their opinion secretly. Then share. You might be surprised how many people actually disagree!"
      },
      "2": {
        "definition": "A psychological phenomenon where the desire for group harmony or conformity results in irrational or poor decision-making — dissenting opinions are suppressed, alternatives are not fully examined, and the group develops an illusion of invulnerability.",
        "scenarioDoneTo": "Your team rallies around a strategy that 'feels right.' Nobody voices concerns because the mood is positive and the leader seems confident. Months later, obvious problems emerge that multiple people saw but didn't mention.",
        "scenarioYouDo": "You're in a hiring committee and everyone loves a candidate. You notice a resume red flag but stay quiet because voicing concerns would disrupt the enthusiasm. The hire doesn't work out for exactly the reason you noticed.",
        "challenge": {
          "scenario": "The Bay of Pigs invasion is a classic groupthink example: Kennedy's advisors suppressed their doubts about the plan, each assuming they were the only one with concerns. The operation was a disaster.",
          "options": ["Bandwagon Effect", "Authority Bias", "Groupthink", "False Consensus Effect"],
          "correct": 2
        },
        "tip": "Assign a 'devil's advocate' role in every important group decision. Make it safe — and expected — for someone to argue against the majority position."
      },
      "3": {
        "definition": "A mode of thinking in highly cohesive groups where the desire for unanimity overrides realistic appraisal of alternatives — characterized by self-censorship, illusion of unanimity, direct pressure on dissenters, and collective rationalization.",
        "scenarioDoneTo": "The Challenger disaster investigation revealed groupthink: engineers who raised safety concerns about O-ring failure in cold temperatures were overruled by management momentum and schedule pressure, with devastating consequences.",
        "scenarioYouDo": "Your board unanimously approves a major acquisition. After it fails, it emerges that several board members had serious doubts but assumed they were alone in their concerns — the unanimity was an illusion created by mutual self-censorship.",
        "challenge": {
          "scenario": "Janis identified eight symptoms of groupthink: illusion of invulnerability, collective rationalization, belief in inherent morality, stereotyping outgroups, pressure on dissenters, self-censorship, illusion of unanimity, and self-appointed mindguards.",
          "options": ["Groupthink", "Bandwagon Effect", "False Consensus Effect", "In-Group Bias"],
          "correct": 0
        },
        "tip": "Implement structured dissent: anonymous input before meetings, mandatory devil's advocate rotation, and leaders speaking LAST so they don't anchor the group. The best decisions come from teams where disagreement is safe."
      }
    }
  },
  {
    "id": "anchoring-adjustment",
    "name": "Adjustment Insufficiency",
    "tiers": {
      "1": {
        "definition": "When you start with one number and try to adjust, but you don't adjust enough — your final answer stays too close to where you started.",
        "scenarioDoneTo": "Your teacher asks 'How many jellybeans are in this jar?' The kid who guesses first says 200, and now everyone else guesses between 150 and 250 — even though the real answer is 500.",
        "scenarioYouDo": "You guess there are 50 states in Europe because there are 50 states in America. You know it's probably different, but you can't make yourself guess a very different number. (There are about 44 countries in Europe.)",
        "challenge": {
          "scenario": "Asked to estimate the population of Chicago, kids who first thought about their own small town of 5,000 guessed way lower than kids who first thought about New York City.",
          "options": ["Anchoring Bias", "Adjustment Insufficiency", "Framing Effect"],
          "correct": 1
        },
        "tip": "When estimating something, try starting from a DIFFERENT number than the first one that pops into your head. See if you get a different answer — you probably will!"
      },
      "2": {
        "definition": "The cognitive tendency to make estimates by starting from an initial value (anchor) and adjusting from it, but typically adjusting insufficiently — leading to final answers that are biased toward the starting point.",
        "scenarioDoneTo": "When you negotiate salary based on your previous salary rather than market rate, you're anchored to your old number and adjustments end up insufficient — this is why salary history bans exist in some jurisdictions.",
        "scenarioYouDo": "You estimate a project budget by looking at last year's budget and adding 10%. But this year's project is completely different — you should have estimated from scratch, but the anchor of last year's number was too strong.",
        "challenge": {
          "scenario": "In Tversky and Kahneman's wheel-of-fortune experiment, people adjusted from a random number but never enough — the random anchor influenced their final estimate of completely unrelated facts.",
          "options": ["Anchoring Bias", "Adjustment Insufficiency", "Availability Heuristic", "Status Quo Bias"],
          "correct": 1
        },
        "tip": "Try 'estimate from both sides': make one estimate starting high and adjusting down, and another starting low and adjusting up. Average them for a less biased result."
      },
      "3": {
        "definition": "A systematic bias where people anchor to an initial value and make serial adjustments that are too small, leading to estimates that are consistently pulled toward the anchor — this occurs even when the anchor is obviously irrelevant to the estimation task.",
        "scenarioDoneTo": "Real estate appraisals demonstrate this: even professional appraisers are significantly influenced by the listing price when estimating a property's value, producing appraisals that cluster around whatever number was provided as a starting point.",
        "scenarioYouDo": "When setting performance targets, you anchor to last year's results and adjust by a percentage. This perpetuates historical baselines rather than reflecting optimal targets — each year's anchor becomes the foundation for the next, compounding the bias.",
        "challenge": {
          "scenario": "Research shows that even when people are given anchors that are obviously absurd (e.g., 'Is the population of Chicago more or less than 200 million?'), their subsequent estimates are still pulled significantly toward the anchor.",
          "options": ["Adjustment Insufficiency", "Anchoring Bias", "Framing Effect", "Confirmation Bias"],
          "correct": 0
        },
        "tip": "Use base-rate data and analytical decomposition rather than anchor-and-adjust. Break estimates into components you can research independently, then combine them — this reduces reliance on any single anchor."
      }
    }
  },
  {
    "id": "naive-realism",
    "name": "Naive Realism",
    "tiers": {
      "1": {
        "definition": "When you think you see the world exactly as it is, and anyone who disagrees must be wrong, biased, or not paying attention.",
        "scenarioDoneTo": "You and your sibling argue about who started the fight. You both think YOU saw what really happened and the other person is lying. Actually, you both saw it differently.",
        "scenarioYouDo": "You think your taste in music is just good taste — and people who like different music have bad taste. But they feel the exact same way about THEIR music.",
        "challenge": {
          "scenario": "Two kids watch the same soccer play. One sees a clear foul, the other sees a clean tackle. Both are 100% sure they're right and the other is wrong.",
          "options": ["Confirmation Bias", "False Consensus Effect", "Naive Realism"],
          "correct": 2
        },
        "tip": "Remember: everyone thinks they see the world clearly. When you disagree with someone, they feel just as sure as you do. Try to understand WHY they see it differently."
      },
      "2": {
        "definition": "The belief that you perceive reality objectively and without bias, while others who disagree are uninformed, irrational, or biased — failing to recognize that everyone's perception is shaped by their own experiences and cognitive biases.",
        "scenarioDoneTo": "In any political debate, both sides genuinely believe they're the 'reasonable' ones and the other side is either ignorant or acting in bad faith. Both sides are experiencing naive realism.",
        "scenarioYouDo": "You watch a news report and think you're absorbing the objective facts. When someone interprets the same report differently, your first thought is 'They must not have understood it' — rather than 'Maybe we're each filtering it differently.'",
        "challenge": {
          "scenario": "In a famous study, pro-Israeli and pro-Arab viewers watched the same news coverage of a conflict. Both groups independently concluded the coverage was biased AGAINST their side.",
          "options": ["Confirmation Bias", "Naive Realism", "False Consensus Effect", "In-Group Bias"],
          "correct": 1
        },
        "tip": "Practice saying 'I might be seeing this through my own lens.' The most rational position is recognizing that your perception is filtered — just like everyone else's."
      },
      "3": {
        "definition": "The conviction that one's own perceptions are direct, unmediated representations of reality — leading to the assumption that reasonable people will naturally agree with you, and those who don't must be lazy, biased, or acting in bad faith.",
        "scenarioDoneTo": "Ross and Ward identified three tenets: (1) I see things as they are, (2) others will agree with me if they have the same information and process it rationally, (3) those who disagree must be uninformed, irrational, or biased.",
        "scenarioYouDo": "As a leader, you present your strategic vision as the 'obvious' path forward. When team members raise alternatives, you interpret their disagreement as resistance or incomprehension rather than legitimate different perspectives informed by different experiences.",
        "challenge": {
          "scenario": "Naive realism is considered a 'meta-bias' — a bias about biases: the belief that you are less biased than others, which prevents you from correcting your actual biases because you don't believe you have any.",
          "options": ["Naive Realism", "Dunning-Kruger Effect", "False Consensus Effect", "Blind Spot Bias"],
          "correct": 0
        },
        "tip": "Adopt 'epistemological humility': assume your perceptions are as filtered as everyone else's. When someone disagrees, default to 'What are they seeing that I'm not?' instead of 'Why can't they see what I see?'"
      }
    }
  }
]

# Check for duplicates
for card in new_cards:
    if card['id'] in existing_ids:
        print(f"ERROR: Duplicate ID '{card['id']}'!")
        sys.exit(1)

d['cards'].extend(new_cards)
print(f"Added {len(new_cards)} new biases → Total: {len(d['cards'])}")

with open('data/cognitive-biases.json', 'w') as f:
    json.dump(d, f, indent=2, ensure_ascii=False)
    f.write('\n')

print("Batch 1 complete!")
for c in new_cards:
    print(f"  + {c['name']}")
