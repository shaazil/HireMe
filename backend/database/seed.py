"""
Database seeding — populates questions and coding challenges on first run.
"""

import logging
from sqlalchemy.orm import Session

from models.question import QuestionBank, QuestionCategory, QuestionDifficulty
from models.coding import CodingChallenge, ChallengeDifficulty

logger = logging.getLogger(__name__)


def seed_questions(db: Session) -> None:
    """Seed the question bank if empty."""
    count = db.query(QuestionBank).count()
    if count > 0:
        logger.info(f"Question bank already has {count} questions, skipping seed.")
        return

    questions = [
        # Behavioral
        QuestionBank(
            question_text="Tell me about yourself and what interests you about this role.",
            category=QuestionCategory.BEHAVIORAL,
            difficulty=QuestionDifficulty.EASY,
            role_tags=["software_engineer", "data_scientist", "product_manager"],
        ),
        QuestionBank(
            question_text="Describe a challenging project you worked on. What obstacles did you face and how did you overcome them?",
            category=QuestionCategory.BEHAVIORAL,
            difficulty=QuestionDifficulty.MEDIUM,
            role_tags=["software_engineer"],
        ),
        QuestionBank(
            question_text="Tell me about a time you had a disagreement with a teammate. How did you resolve it?",
            category=QuestionCategory.BEHAVIORAL,
            difficulty=QuestionDifficulty.MEDIUM,
            role_tags=["software_engineer", "product_manager"],
        ),
        # Technical
        QuestionBank(
            question_text="Explain the difference between a stack and a queue. When would you use each?",
            category=QuestionCategory.TECHNICAL,
            difficulty=QuestionDifficulty.EASY,
            role_tags=["software_engineer"],
        ),
        QuestionBank(
            question_text="What is time complexity? Can you give an example of an O(n log n) algorithm and explain why?",
            category=QuestionCategory.TECHNICAL,
            difficulty=QuestionDifficulty.MEDIUM,
            role_tags=["software_engineer"],
        ),
        QuestionBank(
            question_text="How would you design a URL shortening service? Walk me through the architecture.",
            category=QuestionCategory.TECHNICAL,
            difficulty=QuestionDifficulty.HARD,
            role_tags=["software_engineer"],
        ),
        # Problem Solving
        QuestionBank(
            question_text="How do you approach debugging a complex issue in production?",
            category=QuestionCategory.PROBLEM_SOLVING,
            difficulty=QuestionDifficulty.MEDIUM,
            role_tags=["software_engineer"],
        ),
        QuestionBank(
            question_text="How do you prioritize tasks when working under tight deadlines with competing priorities?",
            category=QuestionCategory.PROBLEM_SOLVING,
            difficulty=QuestionDifficulty.MEDIUM,
            role_tags=["software_engineer", "product_manager"],
        ),
        # Communication
        QuestionBank(
            question_text="How do you explain technical concepts to non-technical stakeholders?",
            category=QuestionCategory.COMMUNICATION,
            difficulty=QuestionDifficulty.MEDIUM,
            role_tags=["software_engineer", "product_manager"],
        ),
        QuestionBank(
            question_text="How do you ensure your code is maintainable and readable for other developers?",
            category=QuestionCategory.COMMUNICATION,
            difficulty=QuestionDifficulty.EASY,
            role_tags=["software_engineer"],
        ),
    ]

    db.add_all(questions)
    db.commit()
    logger.info(f"Seeded {len(questions)} questions.")


def seed_coding_challenges(db: Session) -> None:
    """Seed coding challenges if empty."""
    count = db.query(CodingChallenge).count()
    if count > 0:
        logger.info(f"Already have {count} coding challenges, skipping seed.")
        return

    challenges = [
        CodingChallenge(
            title="Two Sum",
            description=(
                "Given an array of integers `nums` and an integer `target`, return the indices "
                "of the two numbers that add up to `target`.\n\n"
                "You may assume that each input has exactly one solution, and you may not use "
                "the same element twice.\n\n"
                "**Example:**\n"
                "```\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\n"
                "Explanation: nums[0] + nums[1] = 2 + 7 = 9\n```"
            ),
            difficulty=ChallengeDifficulty.EASY,
            starter_code={
                "python": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your code here\n    pass",
                "javascript": "function twoSum(nums, target) {\n    // Your code here\n}",
            },
            test_cases=[
                {"input": "[2,7,11,15]\n9", "expected": "[0, 1]", "hidden": False},
                {"input": "[3,2,4]\n6", "expected": "[1, 2]", "hidden": False},
                {"input": "[3,3]\n6", "expected": "[0, 1]", "hidden": True},
                {"input": "[1,5,8,3,9,2]\n7", "expected": "[1, 5]", "hidden": True},
            ],
        ),
        CodingChallenge(
            title="FizzBuzz",
            description=(
                "Write a function that returns a list of strings for numbers 1 to n.\n\n"
                "- For multiples of 3, use `\"Fizz\"`\n"
                "- For multiples of 5, use `\"Buzz\"`\n"
                "- For multiples of both 3 and 5, use `\"FizzBuzz\"`\n"
                "- Otherwise, use the number as a string\n\n"
                "**Example:**\n"
                "```\nInput: n = 5\nOutput: [\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]\n```"
            ),
            difficulty=ChallengeDifficulty.EASY,
            starter_code={
                "python": "def fizzbuzz(n: int) -> list[str]:\n    # Your code here\n    pass",
                "javascript": "function fizzBuzz(n) {\n    // Your code here\n}",
            },
            test_cases=[
                {"input": "5", "expected": '["1","2","Fizz","4","Buzz"]', "hidden": False},
                {"input": "15", "expected": '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', "hidden": False},
                {"input": "1", "expected": '["1"]', "hidden": True},
            ],
        ),
        CodingChallenge(
            title="Valid Parentheses",
            description=(
                "Given a string containing only `()`, `{}`, and `[]`, determine if the input string is valid.\n\n"
                "A string is valid if:\n"
                "- Open brackets are closed by the same type of brackets\n"
                "- Open brackets are closed in the correct order\n"
                "- Every close bracket has a corresponding open bracket\n\n"
                "**Example:**\n"
                "```\nInput: s = \"()[]{}\"\nOutput: true\n\n"
                "Input: s = \"(]\"\nOutput: false\n```"
            ),
            difficulty=ChallengeDifficulty.EASY,
            starter_code={
                "python": "def is_valid(s: str) -> bool:\n    # Your code here\n    pass",
                "javascript": "function isValid(s) {\n    // Your code here\n}",
            },
            test_cases=[
                {"input": "()[]{}", "expected": "true", "hidden": False},
                {"input": "(]", "expected": "false", "hidden": False},
                {"input": "([)]", "expected": "false", "hidden": True},
                {"input": "{[]}", "expected": "true", "hidden": True},
            ],
        ),
        CodingChallenge(
            title="Reverse Linked List",
            description=(
                "Given the head of a singly linked list, reverse the list and return the reversed list.\n\n"
                "**Example:**\n"
                "```\nInput: head = [1, 2, 3, 4, 5]\nOutput: [5, 4, 3, 2, 1]\n```\n\n"
                "**Constraints:**\n"
                "- The number of nodes is in the range [0, 5000]\n"
                "- -5000 <= Node.val <= 5000"
            ),
            difficulty=ChallengeDifficulty.MEDIUM,
            starter_code={
                "python": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head: ListNode) -> ListNode:\n    # Your code here\n    pass",
                "javascript": "function reverseList(head) {\n    // Your code here\n}",
            },
            test_cases=[
                {"input": "[1,2,3,4,5]", "expected": "[5,4,3,2,1]", "hidden": False},
                {"input": "[1,2]", "expected": "[2,1]", "hidden": False},
                {"input": "[]", "expected": "[]", "hidden": True},
            ],
        ),
    ]

    db.add_all(challenges)
    db.commit()
    logger.info(f"Seeded {len(challenges)} coding challenges.")


def seed_all(db: Session) -> None:
    """Run all seeders."""
    seed_questions(db)
    seed_coding_challenges(db)
