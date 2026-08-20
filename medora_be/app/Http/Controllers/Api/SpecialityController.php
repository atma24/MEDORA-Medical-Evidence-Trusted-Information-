<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Speciality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpecialityController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Speciality::orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:specialities,name'],
        ]);

        return response()->json(Speciality::create($request->only('name')), 201);
    }

    public function update(Request $request, Speciality $speciality): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('specialities', 'name')->ignore($speciality->id)],
        ]);

        $speciality->update($request->only('name'));

        return response()->json($speciality->fresh());
    }

    public function destroy(Speciality $speciality): JsonResponse
    {
        abort_if($speciality->users()->exists(), 422, 'Bidang keahlian ini masih memiliki reviewer.');

        $speciality->delete();

        return response()->json(['message' => 'Bidang keahlian berhasil dihapus.']);
    }
}
