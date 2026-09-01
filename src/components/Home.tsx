import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import GroupCustom from '../icons/GroupCustom';
import ArrowForwardCustom from '../icons/ArrowForwardCustom';

const cardData = [
  {
    title: 'Group KYC',
    description: 'For group investments and schemes',
    link: '/kyc/group',
    buttonLabel: 'Start Group KYC Form',
  },
  {
    title: 'Corporate KYC',
    description: 'For corporate entities and organisations',
    link: '/kyc/corporate',
    buttonLabel: 'Start Corporate KYC Form',
  },
  {
    title: 'Individual KYC',
    description: 'For individual investors and clients',
    link: '/kyc/individual',
    buttonLabel: 'Start Individual KYC Form',
  },
];

const Home: React.FC = () => {
  return (
    <div
      className="min-h-screen px-4 sm:px-6 md:px-8 py-12"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="max-w-5xl w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-6 sm:px-10 md:px-14 py-10 md:py-16">
          <h1 className="text-center font-bold text-black text-2xl sm:text-3xl md:text-[2.75rem] leading-[1.4] md:leading-[3rem] mb-10 font-montserrat">
            Welcome, please select one of the forms below to begin
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cardData.map((card) => (
              <Card
                key={card.title}
                className="border border-gray-200 rounded-xl shadow-none flex flex-col"
              >
                <CardContent className="flex-grow p-5 flex flex-col">
                  <div className="flex items-start mb-4">
                    <GroupCustom className="w-12 h-12 text-[#333333] flex-shrink-0 mr-3" />
                    <div>
                      <h3 className="font-bold text-om-dark mb-1 text-lg">
                        {card.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed text-sm">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="default"
                    className="w-full bg-gradient-to-r from-om-gradient-start to-om-gradient-end hover:from-om-gradient-hover-start hover:to-om-gradient-hover-end shadow-[0_2px_8px_rgba(0,100,55,0.25)] hover:shadow-[0_4px_12px_rgba(0,100,55,0.35)] mt-auto"
                  >
                    <Link to={card.link} className="flex items-center justify-center">
                      <ArrowForwardCustom className="w-4 h-4 mr-2" />
                      {card.buttonLabel}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
