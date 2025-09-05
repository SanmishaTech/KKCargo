<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogger
{
    /**
     * Write an activity log entry.
     *
     * @param string $action
     * @param Model|string|array|null $subject
     * @param string|null $description
     * @param array $properties
     * @return ActivityLog
     */
    public static function log(string $action, $subject = null, ?string $description = null, array $properties = []): ActivityLog
    {
        $user = auth()->user();
        $request = request();

        $subjectType = null;
        $subjectId = null;

        if ($subject instanceof Model) {
            $subjectType = get_class($subject);
            $subjectId = $subject->getKey();
        } elseif (is_string($subject)) {
            $subjectType = $subject;
        } elseif (is_array($subject)) {
            $properties = array_merge($properties, ['subject' => $subject]);
        }

        return ActivityLog::create([
            'user_id'      => $user ? $user->id : null,
            'action'       => $action,
            'subject_type' => $subjectType,
            'subject_id'   => $subjectId,
            'description'  => $description,
            'properties'   => !empty($properties) ? $properties : null,
            'ip_address'   => $request ? $request->ip() : null,
            'user_agent'   => $request ? $request->header('User-Agent') : null,
        ]);
    }
}

