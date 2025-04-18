// components/TextField.tsx
type TextFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

export default function TextField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  type = "text",
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-[#b3b3b3] text-sm mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        type={type}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg bg-[#262626] border ${
          error ? "border-red-500" : "border-[#373737]"
        } text-white focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:border-transparent`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
