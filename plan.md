📋 MEDORA Frontend Implementation Plan
🎯 Objective
Transform the current design-only frontend into a fully functional application connected to Laravel backend APIs and ML service.
🏗️ Current State Analysis:
✅ Done: Complete UI design across all pages  
✅ Done: API configuration (axios instance)  
✅ Done: Authentication logic in api.ts  
✅ Missing: Actual API calls  
✅ Missing: State management  
✅ Missing: Page data fetching  
✅ Missing: Form submissions  
✅ Missing: Real-time features  
🚀 Implementation Phases
Phase 1: Infrastructure & State Management (Foundation)
Tasks:
1. Set up Zustand stores for state management
- auth.store.ts - User session, token, role
- claims.store.ts - Claim CRUD operations
- review.store.ts - Reviewer workflow state
- ui.store.ts - Loading states, notifications
2. Create API service layer
- src/lib/services/auth.service.ts
- src/lib/services/claim.service.ts
- src/lib/services/review.service.ts
- src/lib/services/article.service.ts
3. Implement typed interfaces
- Define TypeScript types for all models
- Create response validation schemas
4. Add notification system
- Toast notifications for success/error messages
- Loading indicators for async operations
Priority Files to Create:
medora_fe/src/
├── lib/
│   ├── api.ts ✅ (existing - needs updating)
│   ├── services/
│   │   ├── auth.service.ts ← NEW
│   │   ├── claim.service.ts ← NEW
│   │   ├── review.service.ts ← NEW
│   │   └── article.service.ts ← NEW
│   └── types/
│       ├── index.ts ← NEW
│       ├── models.ts ← NEW
│       └── responses.ts ← NEW
└── stores/
    ├── auth.store.ts ← NEW
    ├── claims.store.ts ← NEW
    └── ui.store.ts ← NEW
Phase 2: Authentication Flow (Critical Path)
Pages to Connect:
Login (/auth/login)
- ✅ Design exists
- 🔧 Need to connect to:
- POST /api/login
- POST /api/logout
- GET /api/user (to fetch user info after login)
- Add: Remember me functionality
- Add: Google OAuth callback handling
Register (/auth/register)
- ✅ Design exists
- 🔧 Need to connect to:
- POST /api/register
- Validate specialty selection
- Handle email verification
Profile Management (/user/pengaturan-akun, /reviewer/pengaturan-akun)
- 🔧 Need to connect to:
- GET /api/user
- PUT /api/profile/update
- PUT /api/profile/password
- DELETE /api/account
User Stories to Implement:
- "As a user, I can log in with my credentials"
- "As a reviewer applicant, I can apply for reviewer account"
- "As a logged-in user, I can see my profile"
Phase 3: User Dashboard & Claim Submission (Core Feature)
Dashboard (/user/dashboard)
- API Calls Needed:
- GET /api/claims - List user's claims
- GET /api/claims?status=active - Recent claims
- GET /api/stats - Claim statistics
- Components:
- Claims list with status badges
- Quick action buttons
- Recent activity feed
New Claim (/user/klaim-baru)
- API Calls Needed:
- POST /api/claims → Triggers AnalyzeClaimJob → Calls ML API
- Polling or WebSocket for job progress
- Flow:
1. User enters claim text
2. Submit → POST to backend
3. Backend starts job → Returns claim_id
4. Frontend polls /api/claims/{id} every 2s
5. On completion → Redirect to claim details
Claim Details (/user/riwayat-klaim/[id])
- API Calls Needed:
- GET /api/claims/{id} → Get claim + TrustAssessment
- Display evidence cards with relevance scores
- Show relationship categories (SUPPORT/CONTRADICT/etc.)
- Trust score visualization
User Stories:
- "As a user, I can submit a new health claim for verification"
- "As a user, I can track the analysis progress of my claim"
- "As a user, I can view detailed results with supporting evidence"
Phase 4: Reviewer Workflow (Admin Features)
Reviewer Dashboard (/reviewer/dashboard)
- API Calls:
- GET /api/reviewer/stats
- GET /api/reviewer/pending-review/count
Claim Queue (/reviewer/antrean-klaim)
- API Calls:
- GET /api/reviewer/claims → Claims needing review
- Filter by specialty, priority
Verification Interface (/reviewer/verifikasi/[id])
- Complex Component:
- Display claim + retrieved evidence
- Reviewer can approve/reject each evidence
- Update reviewer_status via /api/claim/{id}/review-evidence
- Final decision: APPROVE/REJECT via /api/claim/{id}/review
Reports (/reviewer/laporan)
- API Calls:
- GET /api/reviewer/reports → Analytics
- Date range filters
- Export functionality
User Stories:
- "As a reviewer, I can see claims pending my review"
- "As a reviewer, I can evaluate evidence and make decisions"
- "As a reviewer, I can generate performance reports"
Phase 5: Landing Page & Public Features
Landing Page (/)
- Static Content:
- Most sections are static ✓
- Dynamic Sections:
- Klaim Terpopuler: GET /api/popular-claims
- Artikel Medis: GET /api/articles (need to create this endpoint)
- ML Integration:
- Search bar → POST /api/claims → Auto-submit to analysis
Article Section (/user/artikel)
- Need Backend Endpoint:
- GET /api/articles (doesn't exist yet)
- GET /api/articles/{id}
Phase 6: Enhancement & Polish
1. Real-time Updates
- WebSocket for job progress (optional, can use polling first)
- Live notifications when analysis completes
2. Error Handling
- Global error boundaries
- Retry logic for failed requests
- Graceful degradation
3. Performance Optimization
- React.memo for heavy components
- Virtualization for long lists
- Lazy loading for routes
4. Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
🔌 API Endpoint Mapping Reference
Frontend Action	Backend Endpoint
Login	/api/login
Register	/api/register
Get Current User	/api/user
Create Claim	/api/claims
Get All Claims	/api/claims
Get Claim Detail	/api/claims/{id}
Review Evidence	/api/claim/{id}/review-evidence
Review Claim	/api/claim/{id}/review
Get Pending Reviews	/api/reviewer/claims
Get User Stats	/api/stats
❓ Questions Before We Start:
Before I begin implementing, please clarify:
1. Priority Order: Which feature should I build first?
- Option A: Authentication flow (so users can log in first)
- Option B: Claim submission flow (core business logic)
- Option C: Both simultaneously starting with foundation
2. Backend Readiness: 
- Are all the backend endpoints currently working?
- Should I test against localhost or production backend?
3. State Management Preference:
- Using Zustand (already in package.json) ✓
- Or prefer Context API / Redux?
4. Notifications:
- Should I implement toast notifications now?
- Or keep it simple with alerts initially?
5. ML Service:
- Is medora-ml running locally or deployed?
- What's the expected response time for analysis?
📝 Proposed Implementation Order:
If you want me to proceed automatically, I'll follow this order:
1. Week 1: Foundation + Auth
- Setup Zustand stores
- Create typed API services
- Implement login/register flow
2. Week 2: Core Features
- Dashboard with claims list
- New claim submission with real-time status
- Claim details page
3. Week 3: Reviewer Features
- Reviewer dashboard
- Verification interface
- Reports
4. Week 4: Polish
- Error handling
- Performance optimizations
- Testing
What would you like me to do next? 
- A) Start implementation immediately following Phase 1
- B) Ask me more specific questions first
- C) Focus on a particular module only
- D) Show me detailed code examples before committing
Please let me know your preference! 🚀