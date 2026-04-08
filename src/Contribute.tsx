export default function Contribute()
{
    return (
        <div className="flex flex-col gap-4 max-w-2xl">
            <h1 className="text-2xl font-semibold text-white">Contributing</h1>
            <hr className="border-gray-600" />
            <p className="text-gray-300">
                If you're wishing to contribute to this project, feel free to contact this email{" "}
                
                <a href="mailto:llodgical018@gmail.com"
                className="text-blue-400 hover:text-blue-300 underline"
                >
                llodgical018@gmail.com
                </a>
                .
            </p>
            <h2 className="text-xl font-semibold text-white">Requirements</h2>
            <p className="text-gray-300">
                You're allowed to contact the email provided without these requirements although, 
                your request will be minimally considered. The following requirements are:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-gray-300">
                <li>You must have experience with React, SQL, and TypeScript</li>
                <li>Have some sort of contact — email, text, or a social platform</li>
                <li>Understand Tailwind CSS and React component patterns</li>
            </ul>
            <p className="text-gray-300">
                That's it! Hope to hear from you and hopefully you enjoy contributing to this website.
            </p>
        </div>
  );
}