"use client";
import { Input } from "components/ResumeForm/Form/InputGroup";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { changeCoverLetterProfile, selectCoverLetter } from "lib/redux/coverLetterSlice";

export const CoverLetterProfileForm = () => {
  const coverLetter = useAppSelector(selectCoverLetter);
  const dispatch = useAppDispatch();
  const { profile } = coverLetter;

  const handleProfileChange = (field: keyof typeof profile, value: string) => {
    dispatch(changeCoverLetterProfile({ field, value }));
  };

  return (
    <section className="flex flex-col gap-3 rounded-md bg-white p-6 pt-4 shadow transition-opacity duration-200">
      <div className="col-span-full grid grid-cols-6 gap-3">
        <Input
          label="Name"
          labelClassName="col-span-full"
          name="name"
          placeholder="Filippo Francesco Magnaghi"
          value={profile.name}
          onChange={handleProfileChange}
        />
        <Input
          label="Role"
          labelClassName="col-span-full"
          name="position"
          placeholder="Full Stack Developer"
          value={profile.position}
          onChange={handleProfileChange}
        />
        <Input
          label="Email"
          labelClassName="col-span-4"
          name="email"
          placeholder="rawfilippo@gmail.com"
          value={profile.email}
          onChange={handleProfileChange}
        />
        <Input
          label="Phone"
          labelClassName="col-span-2"
          name="phone"
          placeholder="(123)456-7890"
          value={profile.phone}
          onChange={handleProfileChange}
        />
        <Input
          label="Website"
          labelClassName="col-span-4"
          name="location"
          placeholder="linkedin.com/in/filippomagnaghi/"
          value={profile.location}
          onChange={handleProfileChange}
        />
        <Input
          label="Extra"
          labelClassName="col-span-2"
          name="date"
          placeholder="Spontaneous Application"
          value={profile.date}
          onChange={handleProfileChange}
        />
        <Input
          label="Company"
          labelClassName="col-span-3"
          name="company"
          placeholder="TechInnovate S.r.l."
          value={profile.company}
          onChange={handleProfileChange}
        />
        <Input
          label="Greeting"
          labelClassName="col-span-3"
          name="hiringManager"
          placeholder="Dear Hiring Manager,"
          value={profile.hiringManager}
          onChange={handleProfileChange}
        />
        <Input
          label="Closing"
          labelClassName="col-span-3"
          name="closing"
          placeholder="Kind Regards,"
          value={profile.closing}
          onChange={handleProfileChange}
        />
      </div>
    </section>
  );
};
