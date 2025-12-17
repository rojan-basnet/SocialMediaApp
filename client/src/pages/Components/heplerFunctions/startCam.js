
export const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        return stream;

    } catch (error) {
        console.error("Camera error:", error);
    }
};

export const stopCamera = (streamRef) => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
};
