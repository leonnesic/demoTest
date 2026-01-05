import CardDirector from "../directors/CardDirector";
import SceneDirector from "../directors/SceneDirector";

export const UIActions: Record < string, () => void > = {
    /** Reveals card UI and resets related panels. */
    showcards: () => {
        CardDirector.create(144);
        SceneDirector.hideGroup(['dialogues', 'cards', 'particles']);
        SceneDirector.showGroup('cards');
        SceneDirector.showContainer('buttonStartTween');
        SceneDirector.showContainer('buttonReset');
    },
    /** Shows dialogue panel while hiding other groups. */
    showdialogues: () => {
        CardDirector.reset('reset');
        SceneDirector.hideGroup(['dialogues', 'cards', 'particles']);
        SceneDirector.showGroup('dialogues');
        SceneDirector.hideContainer('buttonStartTween');
        SceneDirector.hideContainer('buttonReset');
    },
    /** Activates the particle panel and hides other groups. */
    showparticles: () => {
        CardDirector.reset('reset');
        SceneDirector.hideGroup(['dialogues', 'cards', 'particles']);
        SceneDirector.showGroup('particles');
        SceneDirector.hideContainer('buttonStartTween');
        SceneDirector.hideContainer('buttonReset');
    },
    /** Launches the tweens that animate the cards. */
    starttween: () => {
        CardDirector.reset('reset');
        CardDirector.start('flyUp');
    },
    /** Resets the card stack to its resting tween state. */
    reset: () => {
        CardDirector.reset('reset');
    },
};