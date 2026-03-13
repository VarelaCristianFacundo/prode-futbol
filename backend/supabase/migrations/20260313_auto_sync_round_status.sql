-- Auto-sync round statuses when match results are updated.
-- When all matches in a round have results (is_finished=true OR scores set),
-- the round is automatically marked as 'finished' and the next pending round opens.
-- When some matches have results but not all, the round is marked 'open' (if pending).

CREATE OR REPLACE FUNCTION public.auto_sync_round_status()
RETURNS TRIGGER AS $$
DECLARE
  v_round_number INTEGER;
  v_total INTEGER;
  v_finished INTEGER;
  v_current_status TEXT;
  v_next_round_number INTEGER;
BEGIN
  v_round_number := NEW.round_number;

  -- Only act when a match is newly finished or scored
  IF NOT (
    (NEW.is_finished IS DISTINCT FROM OLD.is_finished AND NEW.is_finished = true) OR
    (NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL AND
     (OLD.home_score IS NULL OR OLD.away_score IS NULL))
  ) THEN
    RETURN NEW;
  END IF;

  -- Get current round status
  SELECT status INTO v_current_status
  FROM public.rounds
  WHERE round_number = v_round_number;

  -- Don't touch already-finished rounds
  IF v_current_status = 'finished' THEN
    RETURN NEW;
  END IF;

  -- Count total vs finished matches in this round
  SELECT
    COUNT(*),
    COUNT(*) FILTER (
      WHERE is_finished = true
         OR (home_score IS NOT NULL AND away_score IS NOT NULL)
    )
  INTO v_total, v_finished
  FROM public.matches
  WHERE round_number = v_round_number;

  IF v_total > 0 AND v_finished = v_total THEN
    -- All matches done: close any other open round, finish this one, open next
    UPDATE public.rounds
      SET status = 'locked', updated_at = NOW()
    WHERE status = 'open' AND round_number != v_round_number;

    UPDATE public.rounds
      SET status = 'finished', updated_at = NOW()
    WHERE round_number = v_round_number;

    -- Open the very next pending round
    SELECT round_number INTO v_next_round_number
    FROM public.rounds
    WHERE round_number > v_round_number
      AND status = 'pending'
    ORDER BY round_number ASC
    LIMIT 1;

    IF v_next_round_number IS NOT NULL THEN
      UPDATE public.rounds
        SET status = 'open', updated_at = NOW()
      WHERE round_number = v_next_round_number;
    END IF;

  ELSIF v_finished > 0 AND v_current_status = 'pending' THEN
    -- Some matches done and round is still pending: open it (if no other round is open)
    IF NOT EXISTS (SELECT 1 FROM public.rounds WHERE status = 'open') THEN
      UPDATE public.rounds
        SET status = 'open', updated_at = NOW()
      WHERE round_number = v_round_number;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_sync_round_status ON public.matches;

CREATE TRIGGER trg_auto_sync_round_status
AFTER UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.auto_sync_round_status();
