<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\AnalyzeClaimJob;
use App\Models\Claim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->claims()->orderByDesc('created_at')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'text' => ['required', 'string', 'max:5000'],
        ]);

        $claim = $request->user()->claims()->create([
            'text' => $request->text,
        ]);

        AnalyzeClaimJob::dispatch($claim);

        return response()->json($claim->refresh(), 201);
    }

    public function show(Request $request, Claim $claim): JsonResponse
    {
        abort_unless($claim->user_id === $request->user()->id, 403);

        return response()->json($claim);
    }

    public function destroy(Request $request, Claim $claim): JsonResponse
    {
        abort_unless($claim->user_id === $request->user()->id, 403);

        $claim->delete();

        return response()->json(['message' => 'Klaim dihapus.']);
    }
}
