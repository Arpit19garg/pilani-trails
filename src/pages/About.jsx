import React from 'react'

export default function About() {
  return (
    <div className="about-page">
      <h2>About Pilani-Trails</h2>
      <p>This is a student-made, community-driven map for Pilani town. We wanted a playful, chill place where freshers and OGs can share recs — from the best samosa stall to the 24x7 print joint.</p>
      <h3>Why this exists</h3>
      <ul>
        <li>College doesn't publish a neat guide; we do.</li>
        <li>Helps new students save time and avoid getting lost.</li>
        <li>Community-owned: you add, vote, and curate.</li>
      </ul>
      <h3>How to contribute</h3>
      <ol>
        <li>Click on the map to drop a quick pin, then refine it on Contribute page.</li>
        <li>Share the app with your batch — upvotes = cred.</li>
        <li>If you want the data public/publicly hosted, we can later add a backend.</li>
      </ol>
      <p className="muted">Made with ❤️ by students. Not affiliated with BITS Pilani.</p>
    </div>
  )
}
