// src/ui/kreda-form.ts
import { ZaproszeniaKredaOptions } from '../categories/zaproszenia-kreda';

export function KredaForm(props: { onSubmit: (options: ZaproszeniaKredaOptions) => void }) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Get form values here and call props.onSubmit with them
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <select name="sides">
        <option value="1">Jednostronny</option>
        <option value="2">Dwustronny</option>
      </select>
      
      <select name="gramatura">
        {/* Add options here */}
      </select>
      
      {/* Add other form fields as needed */}
      
      <input type="checkbox" name="express" /> EXPRESS
      
      <button type="submit">Oblicz</button>
    </form>
  );
}
