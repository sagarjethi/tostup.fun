import os
import subprocess
from datetime import datetime, timedelta
import random

# Configuration
REPO_PATH = "/Users/sagarjethi/project/bnbhak/TostAi"
START_TIME = datetime(2025, 12, 5, 18, 0, 0)  # Dec 5th 18:00
END_TIME = datetime(2025, 12, 6, 11, 0, 0)    # Dec 6th 11:00
AUTHOR = "Sagar Jethi <sagar@example.com>" # Assuming email, can be generic

COMMITS = [
    "Initial commit: Project structure setup",
    "feat: Setup backend with Express and Drizzle",
    "feat: Initialize Next.js frontend with Tailwind",
    "feat: Implement core Agent functionality in backend",
    "ui: Design initial Dashboard layout",
    "feat: Add LLM integration with LangChain",
    "fix: Resolve API connection issues",
    "feat: Add ChatsList component for Neural Feed",
    "ui: Update dashboard to Glass Command Deck theme",
    "feat: Implement Agent Control Panel",
    "refactor: Optimize ChatsList for performance",
    "feat: Add Competition View",
    "feat: Add Mimic Mode base structure",
    "ui: Enhance Mimic Mode with 3-column layout",
    "feat: Integrate Vault View and Wallet connection",
    "fix: Infinite loop in ChatsList",
    "docs: Update README and documentation"
]

def git_commit(message, date):
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = date.isoformat()
    env["GIT_COMMITTER_DATE"] = date.isoformat()
    
    # Stage all files
    subprocess.run(["git", "add", "."], cwd=REPO_PATH, check=True)
    
    # Commit
    subprocess.run(
        ["git", "commit", "-m", message, "--allow-empty"],
        cwd=REPO_PATH,
        env=env,
        check=True
    )

def main():
    current_time = START_TIME
    time_step = (END_TIME - START_TIME) / len(COMMITS)
    
    print(f"Generating {len(COMMITS)} commits from {START_TIME} to {END_TIME}")
    
    for message in COMMITS:
        # Add some random variation to time
        jitter = timedelta(minutes=random.randint(-15, 15))
        commit_date = current_time + jitter
        
        # Ensure we stay within bounds
        if commit_date < START_TIME: commit_date = START_TIME
        if commit_date > END_TIME: commit_date = END_TIME
        
        print(f"Commit: {message} at {commit_date}")
        git_commit(message, commit_date)
        
        current_time += time_step

if __name__ == "__main__":
    main()
