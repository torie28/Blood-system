import React from 'react';

const SkeletonLoader = ({
    variant = 'default',
    lines = 3,
    height = 'h-4',
    className = '',
    animated = true
}) => {
    const baseClasses = "bg-gray-200 rounded-lg";
    const animationClasses = animated ? "animate-pulse" : "";
    const combinedClasses = `${baseClasses} ${animationClasses} ${className}`;

    const renderSkeleton = () => {
        switch (variant) {
            case 'text':
                return (
                    <div className="space-y-2">
                        {Array.from({ length: lines }).map((_, index) => (
                            <div
                                key={index}
                                className={`${combinedClasses} ${height} ${index === lines - 1 ? 'w-3/4' : 'w-full'
                                    }`}
                            />
                        ))}
                    </div>
                );

            case 'card':
                return (
                    <div className={`${combinedClasses} p-4 space-y-3`}>
                        <div className={`${combinedClasses} h-32 w-full rounded-lg`} />
                        <div className={`${combinedClasses} h-4 w-3/4`} />
                        <div className={`${combinedClasses} h-4 w-1/2`} />
                    </div>
                );

            case 'avatar':
                return (
                    <div className="flex items-center space-x-4">
                        <div className={`${combinedClasses} h-12 w-12 rounded-full`} />
                        <div className="flex-1 space-y-2">
                            <div className={`${combinedClasses} h-4 w-3/4`} />
                            <div className={`${combinedClasses} h-3 w-1/2`} />
                        </div>
                    </div>
                );

            case 'list':
                return (
                    <div className="space-y-3">
                        {Array.from({ length: lines }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className={`${combinedClasses} h-10 w-10 rounded`} />
                                <div className="flex-1 space-y-2">
                                    <div className={`${combinedClasses} h-4 w-full`} />
                                    <div className={`${combinedClasses} h-3 w-2/3`} />
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'table':
                return (
                    <div className="space-y-2">
                        <div className="flex space-x-4 pb-2 border-b">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className={`${combinedClasses} h-4 flex-1`} />
                            ))}
                        </div>
                        {Array.from({ length: lines }).map((_, rowIndex) => (
                            <div key={rowIndex} className="flex space-x-4">
                                {Array.from({ length: 4 }).map((_, colIndex) => (
                                    <div key={colIndex} className={`${combinedClasses} h-8 flex-1`} />
                                ))}
                            </div>
                        ))}
                    </div>
                );

            case 'form':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className={`${combinedClasses} h-4 w-1/4`} />
                            <div className={`${combinedClasses} h-10 w-full`} />
                        </div>
                        <div className="space-y-2">
                            <div className={`${combinedClasses} h-4 w-1/3`} />
                            <div className={`${combinedClasses} h-24 w-full`} />
                        </div>
                        <div className="space-y-2">
                            <div className={`${combinedClasses} h-4 w-1/5`} />
                            <div className={`${combinedClasses} h-10 w-1/2`} />
                        </div>
                    </div>
                );

            case 'image-gallery':
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <div className={`${combinedClasses} h-32 w-full rounded-lg`} />
                                <div className={`${combinedClasses} h-3 w-3/4 mx-auto`} />
                            </div>
                        ))}
                    </div>
                );

            case 'sidebar':
                return (
                    <div className="w-64 space-y-4">
                        <div className={`${combinedClasses} h-8 w-3/4`} />
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className={`${combinedClasses} h-5 w-5 rounded`} />
                                    <div className={`${combinedClasses} h-4 w-full`} />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'product-card':
                return (
                    <div className={`${combinedClasses} p-4 space-y-3`}>
                        <div className={`${combinedClasses} h-48 w-full rounded-lg`} />
                        <div className="space-y-2">
                            <div className={`${combinedClasses} h-4 w-full`} />
                            <div className={`${combinedClasses} h-4 w-3/4`} />
                        </div>
                        <div className="flex justify-between items-center">
                            <div className={`${combinedClasses} h-6 w-20`} />
                            <div className={`${combinedClasses} h-10 w-24 rounded-lg`} />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="space-y-2">
                        {Array.from({ length: lines }).map((_, index) => (
                            <div
                                key={index}
                                className={`${combinedClasses} ${height} ${index === lines - 1 ? 'w-3/4' : 'w-full'
                                    }`}
                            />
                        ))}
                    </div>
                );
        }
    };

    return <div className="skeleton-loader">{renderSkeleton()}</div>;
};

export default SkeletonLoader;