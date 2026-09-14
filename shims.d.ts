// Auto-generated. Do not edit.
declare namespace puvoice {

    /**
     *
     */
    //% shim=puvoice::sayShim
    function sayShim(text: string): void;

    /**
     *
     */
    //% shim=puvoice::pronounceShim
    function pronounceShim(phonemes: string): void;

    /**
     *
     */
    //% shim=puvoice::singShim
    function singShim(text: string): void;

    /**
     *
     */
    //% shim=puvoice::singPhonemesShim
    function singPhonemesShim(phonemes: string): void;

    /**
     *
     */
    //% shim=puvoice::setSingTempoShim
    function setSingTempoShim(tempo: int32): void;

    /**
     *
     */
    //% shim=puvoice::restShim
    function restShim(ms: int32): void;

    /**
     *
     */
    //% shim=puvoice::setVoiceShim
    function setVoiceShim(speed: int32, pitch: int32, mouth: int32, throat: int32): void;

    /**
     *
     */
    //% shim=puvoice::stopShim
    function stopShim(): void;

    /**
     *
     */
    //% shim=puvoice::isBusyShim
    function isBusyShim(): boolean;

    /**
     *
     */
    //% shim=puvoice::setVolumeShim
    function setVolumeShim(volume: int32): void;

    /**
     *
     */
    //% shim=puvoice::setSpeakerEnabledShim
    function setSpeakerEnabledShim(on: boolean): void;

    /**
     *
     */
    //% shim=puvoice::setAudioPinEnabledShim
    function setAudioPinEnabledShim(on: boolean): void;

    /**
     *
     */
    //% shim=puvoice::powerDownShim
    function powerDownShim(): void;

    /**
     * Convert English text to a SAM phoneme string without speaking it.
     * Returns an empty string while speech is in progress (the reciter shares
     * state with the renderer and cannot run concurrently).
     */
    //% shim=puvoice::toPhonemesShim
    function toPhonemesShim(text: string): string;
}

// Auto-generated. Do not edit. Really.
