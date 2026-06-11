export default function Contribute() {
  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <h1 className="text-3xl font-bold text-white">Contributing</h1>
      <div className="divider" />
      <p className="text-gray-300">
        If you're wishing to contribute to this project, feel free to contact us at{' '}
        <a href="mailto:llodgical018@gmail.com" className="text-blue-400 hover:text-blue-300 underline">
          llodgical018@gmail.com
        </a>.
      </p>
      <h2 className="text-xl font-semibold text-white mt-2">Requirements</h2>
      <p className="text-gray-300">
        You're allowed to contact the email provided without these requirements although your request
        will be minimally considered. The following requirements are:
      </p>
      <ul className="text-gray-300 space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          You must have experience with React, SQL, and TypeScript
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          Have some sort of contact — this can be email, text, or a social platform
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          Understand Tailwind CSS design guidelines and React components
        </li>
      </ul>
      <p className="text-gray-300">That's it! Hope to hear from you and hopefully you enjoy contributing to this website.</p>
    </div>
  );
}