export default function SettingsPanel({
  isOpen,
  onClose,
  mirrorHorizontal,
  setMirrorHorizontal,
  mirrorVertical,
  setMirrorVertical,
  fontSize,
  setFontSize,
  background,
  setBackground,
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col justify-center items-center text-white p-6 z-50">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <div>
          <label className="block mb-1 text-gray-300">Font Size</label>
          <input
            type="range"
            min="24"
            max="120"
            step="4"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-gray-400 text-sm mt-1">{fontSize}px</p>
        </div>

        <div>
          <label className="block mb-1 text-gray-300">Background</label>
          <select
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded p-2 w-full"
          >
            <option value="black">Black</option>
            <option value="white">White</option>
            <option value="gray">Gray</option>
          </select>
        </div>

        <div className="flex gap-4 mt-2">
          <label>
            <input
              type="checkbox"
              checked={mirrorHorizontal}
              onChange={() => setMirrorHorizontal(!mirrorHorizontal)}
              className="mr-2"
            />
            Mirror Horizontally
          </label>

          <label>
            <input
              type="checkbox"
              checked={mirrorVertical}
              onChange={() => setMirrorVertical(!mirrorVertical)}
              className="mr-2"
            />
            Mirror Vertically
          </label>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-6 bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg"
      >
        Done
      </button>
    </div>
  );
}
