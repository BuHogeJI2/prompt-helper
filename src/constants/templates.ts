export const NEW_TASK_TEMPLATE = `<TASK>

</TASK>

<DESCRIPTION>

</DESCRIPTION>

<CRITERIA>

</CRITERIA>

<NEXT_STEP>
Our next step is to create an implementation plan. Before writing it,
discuss the task with me: clarify unclear details, identify open questions,
and agree on requirements and scope. Create the plan only after we agree
that the discussion is complete. Do not implement anything yet.
</NEXT_STEP>
`;

export const PEER_IMPLEMENTATION_TEMPLATE = `<TASK>

</TASK>

<DESCRIPTION>

</DESCRIPTION>

<CRITERIA>

</CRITERIA>

<WORKTREES>
Create a separate worktree and feature branch for each ticket.
Use feature/<ticket_number>_<short_postfix>.
Check existing feature branch names for naming examples.

Agree on the base branch before creating worktrees.
Keep each ticket's changes in its own worktree.
</WORKTREES>

<COLLABORATION>
Use /peer-chat to work together with the other agent.

Agree on ticket ownership, dependencies, and the division of work.
Roles may change between tickets or phases.

Work on independent tickets in parallel. While one agent implements,
the other can work on another ticket, investigate, or review ready work.
Allow only one agent to modify a given worktree at a time.

Every implementation must be reviewed by the other agent.
An agent's own approval does not count as peer review.
</COLLABORATION>

<WORKFLOW>
For each ticket:

1. Investigate the relevant code and clarify open questions.
2. Use /planning to create an implementation plan.
3. Have the other agent review the plan. Resolve disagreements before
   implementation. Start only after both agents approve it.
4. Implement the agreed phases and use /test-feature to cover the changes
   with relevant tests. Run the required project checks.
5. Have the other agent review the changes and test coverage.
   Address findings and obtain approval of the final changes.
6. Commit approved phases according to the permissions below.
7. Update the existing investigation and plan documents with the result,
   validation, and any remaining work.

Check dependencies before starting tickets in parallel.
If one ticket depends on another, agree on the order and how its changes
will become available to the dependent ticket.
</WORKFLOW>

<PERMISSIONS>
You may commit completed plan phases after the other agent approves
the changes and the required checks pass. Follow repository commit rules.

Do not push without my explicit permission.
</PERMISSIONS>
`;

export interface PromptTemplate {
  id: string;
  name: string;
  text: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  { id: "new-task", name: "New task", text: NEW_TASK_TEMPLATE },
  {
    id: "peer-implementation",
    name: "Peer implementation",
    text: PEER_IMPLEMENTATION_TEMPLATE,
  },
];
