export function addBusinessDays(startDate: Date, daysToAdd: number): Date {
    let currentDate = new Date(startDate);
    // Ensure we don't start counting from a weekend if we are just adding 0 days (though usually we add >=1)
    // If startDate is Saturday/Sunday and we add 0, it should probably move to Monday? 
    // But typically day_offset is at least 1. 
    // Let's stick to the logic: simple addition skipping weekends.

    // First, if we start on a weekend, maybe we should move to Monday first? 
    // Standard logic: If I say "Call in 1 day" and it's Friday, it means Monday.
    // If I say "Call in 1 day" and it's Saturday, it means Tuesday? Or Monday?
    // Let's assume start date is usually a weekday. If it's a weekend, we treat it as if it was Friday?
    // Let's use the provided logic which is robust enough for now.

    let daysAdded = 0;

    // Iterate until we have added the required number of working days
    while (daysAdded < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);

        // Skip weekends (0 = Sunday, 6 = Saturday)
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            daysAdded++;
        }
    }

    // Edge case: If daysToAdd is 0 (e.g. initial task today), check if today is weekend.
    // If result lands on weekend (shouldn't happen with loop above unless daysToAdd=0), move to Monday.
    if (daysToAdd === 0) {
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return currentDate;
}

export function isBusinessDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
}
