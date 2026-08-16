# Interview-day checklist

## Tonight

- [ ] `npm install` and `npm run dev` — confirm it boots on your machine
- [ ] `npm test` — confirm 10 tests pass
- [ ] Hit `/health` in Postman/Thunder Client to confirm the tool works
- [ ] `git init && git add -A && git commit -m "chore: project scaffold"`
- [ ] Read `PATTERNS.md` once end to end so you know what's in it
- [ ] Webcam framing, mic, screen-share test on Google Meet
- [ ] Editor font size up (they're watching on a shared screen), close other tabs
- [ ] Laptop charger, phone hotspot as backup internet
- [ ] Have your ChapterChat / Veil repos open in another window — they often ask
      you to add a feature to a resume project

## First 8 minutes of the round

- [ ] Read the statement twice
- [ ] Delete `example.routes.js`, `example.controller.js`, `example.service.js`,
      `example.repository.js`, `tests/example.test.js` — start clean
- [ ] Ask clarifying questions **out loud**:
      - What's in scope vs out of scope for 90 minutes?
      - Is auth required, or can I assume an authenticated caller?
      - Does data need to survive a restart?
      - Any specific status transitions / business rules you want enforced?
- [ ] Write the entity list and endpoint table into `README.md` before coding
- [ ] Say your plan back to them and get a nod

## Order of build

1. Repository (in-memory) for the main entity
2. Create + Get by id  → test in Postman on screen
3. List with pagination + filter
4. Update / delete
5. **The business rule** (state machine, capacity, conflict) — this is what
   they're actually grading
6. Edge cases: 404, 400, 409
7. Fill in README: assumptions, decisions, what's next

## Last 5 minutes

- [ ] Run the tests on screen
- [ ] Walk the README out loud
- [ ] Name one trade-off and one thing you'd do with more time
- [ ] Ask your questions about their architecture

## Do not

- Go silent for more than ~30 seconds
- Start with the database instead of the API design
- Build breadth over correctness — a working 4 endpoints beats a broken 9
- Bluff. "I haven't used that, here's how I'd find out" scores better than a
  confident wrong answer
