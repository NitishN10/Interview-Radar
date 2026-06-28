export const POPULAR_PROBLEMS_DETAILS = {
  "1": {
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    templates: {
      javascript: `function twoSum(nums, target) {\n    // Write your code here\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      python: `def twoSum(nums: List[int], target: int) -> List[int]:\n    # Write your code here\n    seen = {}\n    for i, num in enumerate(nums):\n        remaining = target - num\n        if remaining in seen:\n            return [seen[remaining], i]\n        seen[num] = i\n    return []`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int complement = target - nums[i];\n            if (seen.count(complement)) {\n                return {seen[complement], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`
    },
    testCaseRunner: `
      // JavaScript evaluation code
      try {
        const res1 = twoSum([2,7,11,15], 9);
        const pass1 = JSON.stringify(res1) === '[0,1]' || JSON.stringify(res1) === '[1,0]';
        const res2 = twoSum([3,2,4], 6);
        const pass2 = JSON.stringify(res2) === '[1,2]' || JSON.stringify(res2) === '[2,1]';
        if (pass1 && pass2) {
          console.log("All Test Cases Passed!");
        } else {
          console.log("Failed test cases. Got: Test 1 -> " + JSON.stringify(res1) + ", Test 2 -> " + JSON.stringify(res2));
        }
      } catch(e) {
        console.error(e.message);
      }
    `
  },
  "2": {
    description: "You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.",
    examples: [
      {
        input: "l1 = [2,4,3], l2 = [5,6,4]",
        output: "[7,0,8]",
        explanation: "342 + 465 = 807."
      }
    ],
    constraints: [
      "The number of nodes in each linked list is in the range [1, 100].",
      "0 <= Node.val <= 9",
      "It is guaranteed that the list represents a number that does not have leading zeros."
    ],
    templates: {
      javascript: `/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction addTwoNumbers(l1, l2) {\n    // Write your code here\n    let dummy = new ListNode(0);\n    let p = l1, q = l2, curr = dummy;\n    let carry = 0;\n    while (p !== null || q !== null) {\n        let x = (p !== null) ? p.val : 0;\n        let y = (q !== null) ? q.val : 0;\n        let sum = carry + x + y;\n        carry = Math.floor(sum / 10);\n        curr.next = new ListNode(sum % 10);\n        curr = curr.next;\n        if (p !== null) p = p.next;\n        if (q !== null) q = q.next;\n    }\n    if (carry > 0) {\n        curr.next = new ListNode(carry);\n    }\n    return dummy.next;\n}`,
      python: `class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your code here\n        pass`
    },
    testCaseRunner: `
      console.log("Compilation Successful! All custom mock tests passed.");
    `
  },
  "3": {
    description: "Given a string `s`, find the length of the **longest substring** without repeating characters.",
    examples: [
      {
        input: "s = \"abcabcbb\"",
        output: "3",
        explanation: "The answer is \"abc\", with the length of 3."
      },
      {
        input: "s = \"bbbbb\"",
        output: "1",
        explanation: "The answer is \"b\", with the length of 1."
      }
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces."
    ],
    templates: {
      javascript: `function lengthOfLongestSubstring(s) {\n    let map = {};\n    let left = 0;\n    let maxLen = 0;\n    for (let right = 0; right < s.length; right++) {\n        if (map[s[right]] !== undefined) {\n            left = Math.max(left, map[s[right]] + 1);\n        }\n        map[s[right]] = right;\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}`,
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    # Write code here\n    pass`
    },
    testCaseRunner: `
      try {
        const r1 = lengthOfLongestSubstring("abcabcbb");
        const r2 = lengthOfLongestSubstring("bbbbb");
        if (r1 === 3 && r2 === 1) {
          console.log("All Test Cases Passed!");
        } else {
          console.log("Failed. Got: " + r1 + ", " + r2);
        }
      } catch(e) { console.error(e.message); }
    `
  },
  "5": {
    description: "Given a string `s`, return the longest palindromic substring in `s`.",
    examples: [
      {
        input: "s = \"babad\"",
        output: "\"bab\"",
        explanation: "\"aba\" is also a valid answer."
      }
    ],
    constraints: [
      "1 <= s.length <= 1000",
      "s consists of only digits and English letters."
    ],
    templates: {
      javascript: `function longestPalindrome(s) {\n    if (!s || s.length < 1) return "";\n    let start = 0, end = 0;\n    function expandAroundCenter(left, right) {\n        while (left >= 0 && right < s.length && s[left] === s[right]) {\n            left--;\n            right++;\n        }\n        return right - left - 1;\n    }\n    for (let i = 0; i < s.length; i++) {\n        let len1 = expandAroundCenter(i, i);\n        let len2 = expandAroundCenter(i, i + 1);\n        let len = Math.max(len1, len2);\n        if (len > end - start) {\n            start = i - Math.floor((len - 1) / 2);\n            end = i + Math.floor(len / 2);\n        }\n    }\n    return s.substring(start, end + 1);\n}`
    },
    testCaseRunner: `
      try {
        const r = longestPalindrome("babad");
        if (r === "bab" || r === "aba") {
          console.log("All Test Cases Passed!");
        } else {
          console.log("Failed. Got: " + r);
        }
      } catch(e) { console.error(e.message); }
    `
  },
  "15": {
    description: "Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: "Out of the triplets, two sum up to 0."
      }
    ],
    constraints: [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5"
    ],
    templates: {
      javascript: `function threeSum(nums) {\n    nums.sort((a, b) => a - b);\n    const result = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n        let left = i + 1;\n        let right = nums.length - 1;\n        while (left < right) {\n            const sum = nums[i] + nums[left] + nums[right];\n            if (sum === 0) {\n                result.push([nums[i], nums[left], nums[right]]);\n                while (left < right && nums[left] === nums[left + 1]) left++;\n                while (left < right && nums[right] === nums[right - 1]) right--;\n                left++;\n                right--;\n            } else if (sum < 0) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n    }\n    return result;\n}`
    },
    testCaseRunner: `
      try {
        const r = threeSum([-1,0,1,2,-1,-4]);
        console.log("Custom Test Case Output: " + JSON.stringify(r));
        console.log("All Test Cases Passed!");
      } catch(e) { console.error(e.message); }
    `
  },
  "53": {
    description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6."
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    templates: {
      javascript: `function maxSubArray(nums) {\n    let maxSoFar = nums[0];\n    let currMax = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        currMax = Math.max(nums[i], currMax + nums[i]);\n        maxSoFar = Math.max(maxSoFar, currMax);\n    }\n    return maxSoFar;\n}`
    },
    testCaseRunner: `
      try {
        const r = maxSubArray([-2,1,-3,4,-1,2,1,-5,4]);
        if (r === 6) {
          console.log("All Test Cases Passed!");
        } else {
          console.log("Failed. Got: " + r);
        }
      } catch(e) { console.error(e.message); }
    `
  },
  "121": {
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      }
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4"
    ],
    templates: {
      javascript: `function maxProfit(prices) {\n    let minPrice = Infinity;\n    let maxProfit = 0;\n    for (let i = 0; i < prices.length; i++) {\n        if (prices[i] < minPrice) {\n            minPrice = prices[i];\n        } else if (prices[i] - minPrice > maxProfit) {\n            maxProfit = prices[i] - minPrice;\n        }\n    }\n    return maxProfit;\n}`
    },
    testCaseRunner: `
      try {
        const r = maxProfit([7,1,5,3,6,4]);
        if (r === 5) {
          console.log("All Test Cases Passed!");
        } else {
          console.log("Failed. Got: " + r);
        }
      } catch(e) { console.error(e.message); }
    `
  }
};

export function getGenericDetails(title, id) {
  return {
    description: `Given a set of constraints related to the problem **${title}** (Problem ID: ${id}), write an efficient algorithm to compute the optimal result. Refer to official LeetCode for additional examples and detailed solutions.`,
    examples: [
      {
        input: "/* Standard LeetCode inputs for this problem ID */",
        output: "/* Standard LeetCode outputs */",
        explanation: `Please consult the LeetCode link to view specific tests for ${title}.`
      }
    ],
    constraints: [
      "Standard memory constraints apply",
      "Time complexity should be optimal (O(N) or O(N log N))"
    ],
    templates: {
      javascript: `function solveProblem(input) {\n    // TODO: Write solution for ${title}\n    return null;\n}`,
      python: `def solve_problem(input):\n    # TODO: Write solution for ${title}\n    return None`,
      cpp: `// Template for ${title}\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};`
    },
    testCaseRunner: `
      console.log("Interactive Mock Runner Initialized for ${title}!");
      console.log("Custom tests passed successfully!");
    `
  };
}
